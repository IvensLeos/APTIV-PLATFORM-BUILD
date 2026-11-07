import { c as connectDB } from './db-CJixkQQl.js';
import { c as getShiftBoundariesMinutes } from './shifts-BgDnDx82.js';
import { p as parseIsoDateUTC, g as getOperationalDateUTC, i as isWeekendUTC } from './plantTime-CYYj0IWy.js';
import { i as isFinishProcess, b as isBuildProcess } from './plantAreas-DImca8Fn.js';
import { i as isFinishArea } from './finishStations-CqmET-3O.js';
import { n as normalizeLevel } from './pieceLevel-B94ZE9fG.js';
import { n as netExpected, c as codedFailureMinutes, u as uncodedMinutes, p as programmedMinutes } from './downtime-CL0KXjNT.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/dashboard/[process]/+page.server.js
function rollup(intervals) {
	return (intervals || []).reduce((acc, row) => {
		acc.totalExpected += netExpected(row);
		acc.codedMinutes += codedFailureMinutes(row);
		acc.uncodedMinutes += uncodedMinutes(row);
		acc.programmedMinutes += programmedMinutes(row);
		return acc;
	}, {
		totalExpected: 0,
		codedMinutes: 0,
		uncodedMinutes: 0,
		programmedMinutes: 0
	});
}
function names(values) {
	return [...new Set((values || []).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}
var load = async ({ params, url }) => {
	const { process } = params;
	const processName = process.toUpperCase().replace(/-/g, " ");
	const wantsFinish = url.searchParams.get("area") === "finish" || isFinishProcess(processName) && !isBuildProcess(processName);
	const selectedMachine = url.searchParams.get("machine");
	const selectedShift = url.searchParams.get("shift") || "ALL";
	const selectedFamily = url.searchParams.get("family");
	const selectedType = url.searchParams.get("type");
	const dateParam = url.searchParams.get("date");
	const selectedDateUTC = parseIsoDateUTC(dateParam) || getOperationalDateUTC();
	try {
		const db = await connectDB();
		let isSpecialDay = isWeekendUTC(selectedDateUTC);
		if (!isSpecialDay) isSpecialDay = await isHoliday(db, selectedDateUTC.toISOString().split("T")[0]);
		const { t09Start, t25Start, t08Start } = getShiftBoundariesMinutes(isSpecialDay);
		const finishMachines = (await db.collection("STATIONS").find({ PROCESS: processName }, { projection: {
			MACHINE: 1,
			AREA: 1
		} }).toArray()).filter((row) => isFinishArea(row.AREA) && row.MACHINE).map((row) => row.MACHINE);
		const basePipeline = [
			{ $match: {
				PROCESS: processName,
				OEEDATE: selectedDateUTC,
				...wantsFinish ? { $or: [{ AREA: "FINISH" }, { MACHINE: { $in: finishMachines } }] } : isFinishProcess(processName) ? {
					MACHINE: { $nin: finishMachines },
					AREA: { $ne: "FINISH" }
				} : {}
			} },
			{ $addFields: { totalMinutes: { $add: [{ $multiply: [{ $hour: "$DATETIME" }, 60] }, { $minute: "$DATETIME" }] } } },
			{ $addFields: { derivedShift: { $cond: [
				{ $and: [{ $gte: ["$totalMinutes", t09Start] }, { $lt: ["$totalMinutes", t25Start] }] },
				"T09",
				{ $cond: [
					{ $and: [{ $gte: ["$totalMinutes", t25Start] }, { $lt: ["$totalMinutes", t08Start] }] },
					"T25",
					"T08"
				] }
			] } } }
		];
		if (selectedShift !== "ALL") basePipeline.push({ $match: { derivedShift: selectedShift } });
		const sharedPipeline = [...basePipeline];
		if (selectedFamily) sharedPipeline.push({ $match: { FAMILY: selectedFamily.toUpperCase() } });
		const detailPipeline = [...sharedPipeline];
		if (selectedType) detailPipeline.push({ $match: { TYPE: selectedType.toUpperCase() } });
		const intervalShape = {
			RATE: "$RATE",
			DURATION: "$DURATION",
			TIME_LOST: "$TIME_LOST",
			TIME_LOST_COMMENT: "$TIME_LOST_COMMENT"
		};
		const [rawStats, rawPareto, rawStreams] = await Promise.all([
			db.collection("OEES").aggregate([
				...detailPipeline,
				{ $group: {
					_id: "$MACHINE",
					totalProduced: { $sum: "$PRODUCED" },
					intervals: { $push: intervalShape },
					families: { $addToSet: "$FAMILY" },
					parts: { $addToSet: "$PARTNUMBER" },
					levels: { $addToSet: "$LEVEL" }
				} },
				{ $sort: { _id: 1 } }
			]).toArray(),
			db.collection("OEES").aggregate([
				...detailPipeline,
				{ $match: {
					TIME_LOST: { $gt: 0 },
					...selectedMachine && { MACHINE: selectedMachine.toUpperCase() }
				} },
				{ $project: { failuresNormalized: { $cond: {
					if: { $isArray: "$TIME_LOST_COMMENT" },
					then: "$TIME_LOST_COMMENT",
					else: [{
						code: "$TIME_LOST_COMMENT",
						minutes: "$TIME_LOST"
					}]
				} } } },
				{ $unwind: "$failuresNormalized" },
				{ $facet: {
					failures: [
						{ $set: { "failuresNormalized.code": { $let: {
							vars: { raw: { $trim: { input: { $ifNull: ["$failuresNormalized.code", ""] } } } },
							in: { $cond: [
								{ $eq: ["$$raw", ""] },
								"Uncoded loss",
								"$$raw"
							] }
						} } } },
						{ $match: {
							"failuresNormalized.minutes": { $gt: 0 },
							$expr: { $not: { $regexMatch: {
								input: "$failuresNormalized.code",
								regex: "^PD-",
								options: "i"
							} } }
						} },
						{ $group: {
							_id: "$failuresNormalized.code",
							mins: { $sum: "$failuresNormalized.minutes" }
						} },
						{ $sort: { mins: -1 } },
						{ $limit: 10 }
					],
					programmed: [{ $match: {
						"failuresNormalized.minutes": { $gt: 0 },
						$expr: { $regexMatch: {
							input: { $ifNull: ["$failuresNormalized.code", ""] },
							regex: "^PD-",
							options: "i"
						} }
					} }, { $group: {
						_id: null,
						mins: { $sum: "$failuresNormalized.minutes" }
					} }]
				} }
			]).toArray(),
			db.collection("OEES").aggregate([...sharedPipeline, { $group: {
				_id: "$TYPE",
				totalProduced: { $sum: "$PRODUCED" },
				intervals: { $push: intervalShape },
				families: { $addToSet: "$FAMILY" },
				machines: { $addToSet: "$MACHINE" }
			} }]).toArray()
		]);
		const paretoFacet = rawPareto[0] || {
			failures: [],
			programmed: []
		};
		return {
			processName,
			area: wantsFinish ? "FINISH" : "BUILD",
			selectedDate: selectedDateUTC.toISOString().split("T")[0],
			stats: rawStats.map((s) => {
				const totals = rollup(s.intervals);
				return {
					machine: s._id,
					totalProduced: s.totalProduced,
					totalExpected: totals.totalExpected,
					totalLostTime: totals.codedMinutes + totals.uncodedMinutes,
					codedMinutes: totals.codedMinutes,
					uncodedMinutes: totals.uncodedMinutes,
					programmedMinutes: totals.programmedMinutes,
					families: names(s.families),
					parts: names(s.parts),
					levels: names((s.levels || []).map((level) => normalizeLevel(level)))
				};
			}),
			streams: rawStreams.map((stream) => {
				const totals = rollup(stream.intervals);
				const expected = totals.totalExpected;
				return {
					type: stream._id || "UNASSIGNED",
					totalProduced: stream.totalProduced,
					totalExpected: expected,
					efficiency: expected > 0 ? Math.round(stream.totalProduced / expected * 100) : 0,
					unplannedMinutes: totals.codedMinutes + totals.uncodedMinutes,
					familyCount: names(stream.families).length,
					machineCount: names(stream.machines).length
				};
			}).sort((a, b) => a.efficiency - b.efficiency || a.type.localeCompare(b.type)),
			pareto: (paretoFacet.failures || []).map((p) => ({
				code: p._id,
				minutes: Math.round(p.mins)
			})),
			programmedMinutes: paretoFacet.programmed?.[0]?.mins || 0
		};
	} catch (error) {
		console.error("Dashboard load failed:", error);
		return {
			processName,
			area: wantsFinish ? "FINISH" : "BUILD",
			stats: [],
			streams: [],
			pareto: [],
			programmedMinutes: 0,
			selectedDate: dateParam || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
		};
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B9JtRrnS.js')).default;
const server_id = "src/routes/dashboard/[process]/+page.server.js";
const imports = ["_app/immutable/nodes/14.mtkawQb7.js","_app/immutable/chunks/zvVA78-c.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/BWkGBcHU.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/bYun5Iyh.js","_app/immutable/chunks/DQrGyi1O.js","_app/immutable/chunks/0tp9clmA.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/CNN20Oai.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=14-CytshBxB.js.map
