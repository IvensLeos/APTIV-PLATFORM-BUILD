import { c as connectDB } from './db-CJixkQQl.js';
import { p as parseIsoDateUTC, g as getOperationalDateUTC, i as isWeekendUTC, q as getShiftBoundariesMinutes } from './plantTime-CjpO2xUR.js';
import { i as isFinishProcess, b as isBuildProcess } from './plantAreas-DImca8Fn.js';
import { i as isFinishArea } from './finishStations-CqmET-3O.js';
import { p as programmedMinutes, u as unplannedMinutes, n as netExpected } from './downtime-Cgg3eN_G.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/dashboard/[process]/+page.server.js
var load = async ({ params, url }) => {
	const { process } = params;
	const processName = process.toUpperCase().replace(/-/g, " ");
	const wantsFinish = url.searchParams.get("area") === "finish" || isFinishProcess(processName) && !isBuildProcess(processName);
	const selectedMachine = url.searchParams.get("machine");
	const selectedShift = url.searchParams.get("shift") || "ALL";
	const selectedFamily = url.searchParams.get("family");
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
		const [rawStats, rawPareto] = await Promise.all([db.collection("OEES").aggregate([
			...basePipeline,
			{ $group: {
				_id: "$MACHINE",
				totalProduced: { $sum: "$PRODUCED" },
				intervals: { $push: {
					RATE: "$RATE",
					DURATION: "$DURATION",
					TIME_LOST: "$TIME_LOST",
					TIME_LOST_COMMENT: "$TIME_LOST_COMMENT"
				} },
				families: { $addToSet: "$FAMILY" },
				parts: { $addToSet: "$PARTNUMBER" },
				levels: { $addToSet: "$LEVEL" }
			} },
			{ $sort: { _id: 1 } }
		]).toArray(), db.collection("OEES").aggregate([
			...basePipeline,
			{ $match: {
				TIME_LOST: { $gt: 0 },
				...selectedMachine && { MACHINE: selectedMachine.toUpperCase() },
				...selectedFamily && { FAMILY: selectedFamily.toUpperCase() }
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
					{ $match: {
						"failuresNormalized.minutes": { $gt: 0 },
						"failuresNormalized.code": { $nin: [null, ""] },
						$expr: { $not: { $regexMatch: {
							input: { $ifNull: ["$failuresNormalized.code", ""] },
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
		]).toArray()]);
		const paretoFacet = rawPareto[0] || {
			failures: [],
			programmed: []
		};
		return {
			processName,
			selectedDate: selectedDateUTC.toISOString().split("T")[0],
			stats: rawStats.map((s) => {
				const intervals = s.intervals || [];
				return {
					machine: s._id,
					totalProduced: s.totalProduced,
					totalExpected: intervals.reduce((sum, row) => sum + netExpected(row), 0),
					totalLostTime: intervals.reduce((sum, row) => sum + unplannedMinutes(row), 0),
					programmedMinutes: intervals.reduce((sum, row) => sum + programmedMinutes(row), 0),
					families: s.families.filter(Boolean),
					parts: s.parts.filter(Boolean),
					levels: s.levels.filter(Boolean)
				};
			}),
			pareto: (paretoFacet.failures || []).map((p) => ({
				code: p._id,
				minutes: p.mins
			})),
			programmedMinutes: paretoFacet.programmed?.[0]?.mins || 0
		};
	} catch (error) {
		console.error("❌ Error Crítico en Servidor Dashboard:", error);
		return {
			processName,
			stats: [],
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

const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DCC9J8D3.js')).default;
const server_id = "src/routes/dashboard/[process]/+page.server.js";
const imports = ["_app/immutable/nodes/16.BIImIVCw.js","_app/immutable/chunks/Dthhb0yr.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/BrvHRPev.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/IhvEcdmO.js","_app/immutable/chunks/DmDi_NRr.js","_app/immutable/chunks/BZM1titd.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=16-B7Wbvr1R.js.map
