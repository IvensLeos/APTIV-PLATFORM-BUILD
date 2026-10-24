import { c as connectDB } from './db-CJixkQQl.js';
import { g as getOperationalDateUTC, p as parseIsoDateUTC, i as isWeekendUTC } from './plantTime-CoBszG0i.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/+page.server.js
var streams = {
	RADAR: [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"PROGRAMMING",
		"EDGEBOND",
		"ROUTERMILLING",
		"ANTENNA ATTACH",
		"LEAKTEST"
	],
	CONTROLLER: [
		"LASER ETCH",
		"SMT",
		"PTH",
		"XRAY",
		"PROGRAMMING",
		"EDGEBOND",
		"CONFORMAL",
		"SCREWDRIVE"
	],
	CAMERA: [
		"LASER ETCH",
		"SMT",
		"UNDERFILL",
		"PTH",
		"ICT"
	],
	"MRR ADAS": [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"SINGULATION",
		"ICT",
		"MOL",
		"LGA CONTAINMENT"
	],
	IFV300: [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"SINGULATION",
		"ICT",
		"MOL"
	],
	"VOLVO DHU": [
		"LASER ETCH",
		"SMT",
		"PTH",
		"XRAY",
		"ROUTERMILLING",
		"ICT"
	],
	IFV600: [
		"LASER ETCH",
		"SMT",
		"PTH",
		"XRAY",
		"PROGRAMMING",
		"ICT"
	],
	"VOLVO VIU": [
		"LASER ETCH",
		"SMT",
		"XRAY"
	],
	"GM DMS": [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"ICT"
	]
};
function middleBypass(steps, names) {
	return (names || []).filter((name) => {
		const index = steps.indexOf(name);
		return index > 0 && index < steps.length - 1;
	});
}
async function loadInventoryBypass(db) {
	const inventoryBypass = {};
	if (!db) return inventoryBypass;
	const docs = await db.collection("INVENTORY_BYPASS").find({}).toArray();
	for (const doc of docs) {
		const steps = streams[doc._id];
		if (!steps) continue;
		inventoryBypass[doc._id] = middleBypass(steps, doc.processes);
	}
	return inventoryBypass;
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
		const [rawLogs, conversionRows, inventoryBypass] = await Promise.all([
			db.collection("OEES").find({ OEEDATE: selectedDate }, { projection: {
				DISPLAY_ID: 1,
				PRODUCED: 1,
				RATE: 1,
				TIME_LOST: 1,
				TIME_LOST_COMMENT: 1,
				PROCESS: 1,
				TYPE: 1,
				FAMILY: 1,
				PARTNUMBER: 1,
				LEVEL: 1,
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
			loadInventoryBypass(db)
		]);
		let lastSync = null;
		if (isLiveDay) lastSync = formatPlantClock((await db.collection("SCRAPE_LOGS").find({}).sort({ timestamp: -1 }).limit(1).next())?.timestamp);
		else lastSync = formatPlantClock(rawLogs.reduce((max, log) => {
			if (!log.UPDATED_AT) return max;
			return !max || log.UPDATED_AT > max ? log.UPDATED_AT : max;
		}, null));
		const logs = rawLogs.map((l) => ({
			PRODUCED: Number(l.PRODUCED) || 0,
			RATE: Number(l.RATE) || 0,
			TIME_LOST: Number(l.TIME_LOST) || 0,
			PROCESS: l.PROCESS || "UNKNOWN",
			TYPE: l.TYPE || "UNKNOWN",
			FAMILY: l.FAMILY || "UNKNOWN",
			PARTNUMBER: l.PARTNUMBER || "UNKNOWN",
			LEVEL: l.LEVEL || "UNKNOWN",
			MACHINE: l.MACHINE || "",
			SERVER_PROCESS: l.SERVER_PROCESS || "",
			DISPLAY_ID: l.DISPLAY_ID || "",
			TIME_LOST_COMMENT: l.TIME_LOST_COMMENT || ""
		}));
		return {
			logs,
			streams,
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
			inventoryBypass,
			conversions: conversionRows.map((row) => ({
				SERVER_PARTNUMBER: row.SERVER_PARTNUMBER || "",
				SERVER_PROCESS: row.SERVER_PROCESS || "",
				REAL_PARTNUMBER: row.REAL_PARTNUMBER || ""
			}))
		};
	} catch {
		return {
			logs: [],
			streams,
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
			conversions: []
		};
	}
};
var actions = { toggleInventoryBypass: async ({ request }) => {
	const form = await request.formData();
	const stream = String(form.get("stream") || "");
	const processName = String(form.get("process") || "");
	const steps = streams[stream];
	if (!steps) return fail(400, { message: "Unknown value stream" });
	const index = steps.indexOf(processName);
	if (index <= 0 || index >= steps.length - 1) return fail(400, { message: "That process cannot be bypassed" });
	const db = await connectDB();
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
const component = async () => component_cache ??= (await import('./_page.svelte-ttCYKuyH.js')).default;
const server_id = "src/routes/+page.server.js";
const imports = ["_app/immutable/nodes/2.DrYWKelv.js","_app/immutable/chunks/vBlyhnAW.js","_app/immutable/chunks/CU36ghjL.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/C8PB3Bl3.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/BHcdqSk-.js","_app/immutable/chunks/COzYFV-k.js","_app/immutable/chunks/Dyaz2rvv.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/RKsnmQ5y.js","_app/immutable/chunks/BOHdJPtS.js","_app/immutable/chunks/ekNJv7IX.js"];
const stylesheets = ["_app/immutable/assets/2.DRVq_exw.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=2-BsIlEmb4.js.map
