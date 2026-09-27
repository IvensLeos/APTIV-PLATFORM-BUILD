import { c as connectDB } from './db-W1d6-Une.js';
import { b as broadcastManager } from './broadcast-Bg8zhrwn.js';
import { g as getOperationalDateUTC, p as parseIsoDateUTC, i as isWeekendUTC } from './plantTime-RlOFrl7D.js';
import { s as slugSegment } from './capturePath-R_tTjP2G.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { r as redirect, i as isRedirect } from './index-CRFfcpCQ.js';
import { ObjectId } from 'mongodb';
import './private-C3tFArXN.js';
import './index-DBqjc0Yf.js';

//#region src/routes/capture/[process]/[machine]/+page.server.js
function resolveMachine(param, names) {
	const wanted = slugSegment(param);
	const match = (names || []).find((name) => slugSegment(name) === wanted);
	if (match) return match;
	return String(param || "").toUpperCase().replace(/-/g, " ");
}
var load = async ({ params, url }) => {
	const { process, machine } = params;
	const processName = process.toUpperCase().replace(/-/g, " ");
	const startOfOpDayUTC = getOperationalDateUTC();
	const selectedDateUTC = parseIsoDateUTC(url.searchParams.get("date")) || startOfOpDayUTC;
	let isSpecialDay = isWeekendUTC(selectedDateUTC);
	const db = await connectDB();
	let machineName = resolveMachine(machine, []);
	try {
		if (!isSpecialDay) isSpecialDay = await isHoliday(db, selectedDateUTC.toISOString().split("T")[0]);
		const stationNames = await db.collection("STATIONS").distinct("MACHINE", { PROCESS: processName });
		machineName = resolveMachine(machine, stationNames);
		const processSlug = slugSegment(processName);
		const machineSlug = slugSegment(machineName);
		if (processSlug && params.process !== processSlug || machineSlug && params.machine !== machineSlug) redirect(301, `/capture/${processSlug}/${machineSlug}${url.search}`);
		const [rawLogs, failureDocs, allParts, allRates] = await Promise.all([
			db.collection("OEES").find({
				MACHINE: machineName,
				OEEDATE: selectedDateUTC
			}).sort({ DATETIME: 1 }).toArray(),
			db.collection("FAILURECODES").find({}).project({
				FAILURECODE: 1,
				_id: 0
			}).toArray(),
			db.collection("ITEMS").find({}).project({
				PARTNUMBER: 1,
				FAMILY: 1,
				LEVEL: 1,
				TYPE: 1,
				_id: 0
			}).toArray(),
			db.collection("RATES").find({ MACHINE: machineName }).project({
				PARTNUMBER: 1,
				MACHINE: 1,
				RATE: 1,
				_id: 0
			}).toArray()
		]);
		await broadcastManager.ready();
		const liveAndonState = broadcastManager.getActiveState(machineName);
		return {
			processName,
			machineName,
			isSpecialDay,
			allParts: allParts.filter((part) => allRates.some((rate) => rate.PARTNUMBER === part.PARTNUMBER)),
			allRates,
			machines: stationNames.sort((a, b) => a.localeCompare(b, void 0, {
				numeric: true,
				sensitivity: "base"
			})),
			selectedDate: selectedDateUTC.toISOString().split("T")[0],
			isReadOnly: selectedDateUTC.getTime() !== startOfOpDayUTC.getTime(),
			logs: rawLogs.map((log) => ({
				...log,
				_id: log._id.toString(),
				DATETIME: log.DATETIME ? log.DATETIME.toISOString() : null,
				OEEDATE: log.OEEDATE ? log.OEEDATE.toISOString().split("T")[0] : null
			})),
			failureCodes: failureDocs.map((d) => ({
				value: d.FAILURECODE,
				label: d.FAILURECODE
			})),
			serverAndonState: liveAndonState ? {
				isActive: true,
				level: liveAndonState.level,
				failureCode: liveAndonState.failureCode
			} : {
				isActive: false,
				level: 0,
				failureCode: ""
			}
		};
	} catch (error) {
		if (isRedirect(error)) throw error;
		console.error("🚨 Error en load de captura:", error);
		return {
			logs: [],
			machines: [],
			failureCodes: [],
			allParts: [],
			allRates: [],
			processName,
			machineName,
			isReadOnly: true,
			isSpecialDay: false,
			selectedDate: selectedDateUTC.toISOString().split("T")[0]
		};
	}
};
var actions = { updateLog: async ({ request }) => {
	const data = await request.formData();
	const id = data.get("id");
	const timeLost = parseInt(data.get("timeLost"), 10) || 0;
	const comment = data.get("comment")?.toString() || "";
	const failureCode = data.get("failureCode")?.toString() || "";
	if (!id) return {
		success: false,
		error: "ID requerido"
	};
	try {
		await (await connectDB()).collection("OEES").updateOne({ _id: new ObjectId(id) }, { $set: {
			TIME_LOST: timeLost,
			TIME_LOST_COMMENT: failureCode,
			COMMENTS: comment,
			UPDATED_AT: /* @__PURE__ */ new Date()
		} });
		return { success: true };
	} catch (err) {
		console.error("🚨 Error actualizando registro OEE:", err);
		return {
			success: false,
			error: "Error interno de base de datos"
		};
	}
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 15;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BesqBT3H.js')).default;
const server_id = "src/routes/capture/[process]/[machine]/+page.server.js";
const imports = ["_app/immutable/nodes/15.CZoY8Ivf.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/yFUBrYTq.js","_app/immutable/chunks/oYli88qG.js","_app/immutable/chunks/ekNJv7IX.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=15-rjrp6bK2.js.map
