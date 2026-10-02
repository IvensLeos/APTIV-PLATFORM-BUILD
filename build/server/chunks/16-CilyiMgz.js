import { c as connectDB } from './db-wxZFJtrv.js';
import { p as parseIsoDateUTC, g as getOperationalDateUTC, i as isWeekendUTC, o as getShiftBoundariesMinutes } from './plantTime-RlOFrl7D.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/dashboard/[process]/+page.server.js
var load = async ({ params, url }) => {
	const { process } = params;
	const processName = process.toUpperCase().replace(/-/g, " ");
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
		const basePipeline = [
			{ $match: {
				PROCESS: processName,
				OEEDATE: selectedDateUTC
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
				totalExpected: { $sum: "$RATE" },
				totalLostTime: { $sum: "$TIME_LOST" },
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
			{ $match: {
				"failuresNormalized.code": { $ne: "" },
				"failuresNormalized.minutes": { $gt: 0 }
			} },
			{ $group: {
				_id: "$failuresNormalized.code",
				mins: { $sum: "$failuresNormalized.minutes" }
			} },
			{ $sort: { mins: -1 } },
			{ $limit: 10 }
		]).toArray()]);
		return {
			processName,
			selectedDate: selectedDateUTC.toISOString().split("T")[0],
			stats: rawStats.map((s) => ({
				machine: s._id,
				totalProduced: s.totalProduced,
				totalExpected: s.totalExpected,
				totalLostTime: s.totalLostTime,
				families: s.families.filter(Boolean),
				parts: s.parts.filter(Boolean),
				levels: s.levels.filter(Boolean)
			})),
			pareto: rawPareto.map((p) => ({
				code: p._id,
				minutes: p.mins
			}))
		};
	} catch (error) {
		console.error("❌ Error Crítico en Servidor Dashboard:", error);
		return {
			processName,
			stats: [],
			pareto: [],
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
const component = async () => component_cache ??= (await import('./_page.svelte-qBIUyAWt.js')).default;
const server_id = "src/routes/dashboard/[process]/+page.server.js";
const imports = ["_app/immutable/nodes/16.BS_ongES.js","_app/immutable/chunks/eA5QwMQ2.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/C8PB3Bl3.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/BHcdqSk-.js","_app/immutable/chunks/CZ2DiBTJ.js","_app/immutable/chunks/Dh2ESufR.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=16-CilyiMgz.js.map
