import { r as requireRole } from './access-DAZySCgG.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { g as getOperationalDateUTC, p as parseIsoDateUTC, i as isWeekendUTC } from './plantTime-C6hdc3to.js';
import { B as BUILD_STREAMS, a as FINISH_ROUTES } from './plantAreas-DImca8Fn.js';
import { p as planKey, e as enrichProductionPlan } from './productionPlan2-CiQespVH.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { f as finishStationKeys, s as stampFinishArea } from './finishStations-CqmET-3O.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './shifts-BYGd7DZC.js';
import './index-DBqjc0Yf.js';

//#region src/routes/+page.server.js
function middleBypass(steps, names) {
	return (names || []).filter((name) => {
		const index = steps.indexOf(name);
		return index > 0 && index < steps.length - 1;
	});
}
async function finishRouteMap(db) {
	const rows = await db.collection("PROCESSES").find({ AREA: "FINISH" }).sort({
		ORDER: 1,
		PROCESS: 1
	}).toArray();
	const routes = {};
	for (const row of rows) {
		const type = row.TYPE || "CAMERA";
		if (!row.PROCESS) continue;
		if (!routes[type]) routes[type] = [];
		routes[type].push(row.PROCESS);
	}
	return Object.keys(routes).length ? routes : FINISH_ROUTES;
}
async function loadInventoryBypass(db) {
	const inventoryBypass = {};
	const finishBypass = {};
	if (!db) return {
		inventoryBypass,
		finishBypass
	};
	const [docs, finishRoutes] = await Promise.all([db.collection("INVENTORY_BYPASS").find({}).toArray(), finishRouteMap(db)]);
	for (const doc of docs) {
		const steps = BUILD_STREAMS[doc._id];
		if (steps) inventoryBypass[doc._id] = middleBypass(steps, doc.processes);
		const finishSteps = finishRoutes[doc._id] || [];
		if (finishSteps.length) finishBypass[doc._id] = middleBypass(finishSteps, doc.finishProcesses);
	}
	return {
		inventoryBypass,
		finishBypass
	};
}
/** UPDATED_AT y SCRAPE_LOGS.timestamp guardan la hora de pared de la planta en campos UTC. */
function formatPlantClock(date) {
	if (!date) return null;
	return new Date(date).toLocaleString("en-US", {
		timeZone: "UTC",
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit"
	});
}
var load = async ({ url }) => {
	const startOfOpDayUTC = getOperationalDateUTC();
	const selectedDate = parseIsoDateUTC(url.searchParams.get("date")) || startOfOpDayUTC;
	const selectedIso = selectedDate.toISOString().split("T")[0];
	const isLiveDay = selectedDate.getTime() === startOfOpDayUTC.getTime();
	try {
		const db = await connectDB();
		let isSpecialDay = isWeekendUTC(selectedDate);
		if (!isSpecialDay) isSpecialDay = await isHoliday(db, selectedIso);
		const [rawLogs, conversionRows, bypassLists, finishKeys, savedPlan] = await Promise.all([
			db.collection("OEES").find({ OEEDATE: selectedDate }, { projection: {
				DISPLAY_ID: 1,
				PRODUCED: 1,
				RATE: 1,
				DURATION: 1,
				TIME_LOST: 1,
				TIME_LOST_COMMENT: 1,
				PROCESS: 1,
				TYPE: 1,
				FAMILY: 1,
				PARTNUMBER: 1,
				LEVEL: 1,
				AREA: 1,
				MACHINE: 1,
				SERVER_PROCESS: 1,
				UPDATED_AT: 1
			} }).sort({ DATETIME: -1 }).toArray(),
			db.collection("PART_CONVERSIONS").find({}, { projection: {
				_id: 0,
				SERVER_PARTNUMBER: 1,
				SERVER_PROCESS: 1,
				REAL_PARTNUMBER: 1
			} }).toArray(),
			loadInventoryBypass(db),
			finishStationKeys(db),
			db.collection("PLANNING").findOne({ key: planKey(selectedIso) })
		]);
		const productionPlan = await enrichProductionPlan(db, savedPlan?.value || []);
		let lastSync = null;
		if (isLiveDay) lastSync = formatPlantClock((await db.collection("SCRAPE_LOGS").find({}).sort({ timestamp: -1 }).limit(1).next())?.timestamp);
		else lastSync = formatPlantClock(rawLogs.reduce((max, log) => {
			if (!log.UPDATED_AT) return max;
			return !max || log.UPDATED_AT > max ? log.UPDATED_AT : max;
		}, null));
		const logs = rawLogs.map((l) => ({
			PRODUCED: Number(l.PRODUCED) || 0,
			RATE: Number(l.RATE) || 0,
			DURATION: Number(l.DURATION) || 0,
			TIME_LOST: Number(l.TIME_LOST) || 0,
			PROCESS: l.PROCESS || "UNKNOWN",
			TYPE: l.TYPE || "UNKNOWN",
			FAMILY: l.FAMILY || "UNKNOWN",
			PARTNUMBER: l.PARTNUMBER || "UNKNOWN",
			LEVEL: l.LEVEL || "UNKNOWN",
			AREA: stampFinishArea(l, finishKeys),
			MACHINE: l.MACHINE || "",
			SERVER_PROCESS: l.SERVER_PROCESS || "",
			DISPLAY_ID: l.DISPLAY_ID || "",
			TIME_LOST_COMMENT: l.TIME_LOST_COMMENT || ""
		}));
		return {
			logs,
			streams: BUILD_STREAMS,
			familyMapping: {
				RADAR: [...new Set(logs.filter((l) => l.TYPE === "RADAR").map((l) => l.FAMILY))],
				CONTROLLER: [...new Set(logs.filter((l) => l.TYPE === "CONTROLLER").map((l) => l.FAMILY))],
				"VOLVO DHU": [...new Set(logs.filter((l) => l.TYPE === "VOLVO DHU").map((l) => l.FAMILY))],
				"MRR ADAS": [...new Set(logs.filter((l) => l.TYPE === "MRR ADAS").map((l) => l.FAMILY))],
				IFV300: [...new Set(logs.filter((l) => l.TYPE === "IFV300").map((l) => l.FAMILY))],
				IFV600: [...new Set(logs.filter((l) => l.TYPE === "IFV600").map((l) => l.FAMILY))],
				"VOLVO VIU": [...new Set(logs.filter((l) => l.TYPE === "VOLVO VIU").map((l) => l.FAMILY))],
				"GM DMS": [...new Set(logs.filter((l) => l.TYPE === "GM DMS").map((l) => l.FAMILY))],
				CAMERA: [...new Set(logs.filter((l) => l.TYPE === "CAMERA").map((l) => l.FAMILY))]
			},
			selectedDate: selectedIso,
			isReadOnly: !isLiveDay,
			isSpecialDay,
			lastSync,
			inventoryBypass: bypassLists.inventoryBypass,
			finishBypass: bypassLists.finishBypass,
			conversions: conversionRows.map((row) => ({
				SERVER_PARTNUMBER: row.SERVER_PARTNUMBER || "",
				SERVER_PROCESS: row.SERVER_PROCESS || "",
				REAL_PARTNUMBER: row.REAL_PARTNUMBER || ""
			})),
			productionPlan,
			planUpdatedAt: savedPlan?.updatedAt || null
		};
	} catch {
		return {
			logs: [],
			streams: BUILD_STREAMS,
			familyMapping: {
				RADAR: [],
				CONTROLLER: [],
				"VOLVO DHU": [],
				"MRR ADAS": [],
				IFV300: [],
				IFV600: [],
				"VOLVO VIU": [],
				"GM DMS": [],
				CAMERA: []
			},
			selectedDate: selectedIso,
			isReadOnly: !isLiveDay,
			isSpecialDay: isWeekendUTC(selectedDate),
			lastSync: null,
			inventoryBypass: {},
			finishBypass: {},
			conversions: [],
			productionPlan: [],
			planUpdatedAt: null
		};
	}
};
var actions = { toggleInventoryBypass: async ({ request, locals }) => {
	requireRole(locals, ["ADMIN"]);
	const form = await request.formData();
	const stream = String(form.get("stream") || "");
	const processName = String(form.get("process") || "");
	const area = String(form.get("area") || "BUILD").toUpperCase();
	const db = await connectDB();
	if (area === "FINISH") {
		const steps = (await finishRouteMap(db))[stream] || [];
		if (!steps.length) return fail(400, { message: "Finish route is not defined" });
		const index = steps.indexOf(processName);
		if (index <= 0 || index >= steps.length - 1) return fail(400, { message: "That process cannot be bypassed" });
		const current = await db.collection("INVENTORY_BYPASS").findOne({ _id: stream });
		const processes = new Set(middleBypass(steps, current?.finishProcesses));
		if (processes.has(processName)) processes.delete(processName);
		else processes.add(processName);
		await db.collection("INVENTORY_BYPASS").updateOne({ _id: stream }, { $set: {
			finishProcesses: [...processes],
			updatedAt: /* @__PURE__ */ new Date()
		} }, { upsert: true });
		return { ok: true };
	}
	const steps = BUILD_STREAMS[stream];
	if (!steps) return fail(400, { message: "Unknown value stream" });
	const index = steps.indexOf(processName);
	if (index <= 0 || index >= steps.length - 1) return fail(400, { message: "That process cannot be bypassed" });
	const current = await db.collection("INVENTORY_BYPASS").findOne({ _id: stream });
	const processes = new Set(middleBypass(steps, current?.processes));
	if (processes.has(processName)) processes.delete(processName);
	else processes.add(processName);
	await db.collection("INVENTORY_BYPASS").updateOne({ _id: stream }, { $set: {
		processes: [...processes],
		updatedAt: /* @__PURE__ */ new Date()
	} }, { upsert: true });
	return { ok: true };
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-iUhcIyHD.js')).default;
const server_id = "src/routes/+page.server.js";
const imports = ["_app/immutable/nodes/2.lH83IVcO.js","_app/immutable/chunks/kHyVhEKm.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/BWkGBcHU.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/bYun5Iyh.js","_app/immutable/chunks/q_NZEQ27.js","_app/immutable/chunks/gLrsi093.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/CP3pb9v4.js","_app/immutable/chunks/LlHMmW_j.js","_app/immutable/chunks/DJtW1GKF.js","_app/immutable/chunks/BdF4nNdE.js","_app/immutable/chunks/CNN20Oai.js"];
const stylesheets = ["_app/immutable/assets/2.DRVq_exw.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=2-DsG9JLzH.js.map
