import { c as connectDB } from './db-CJixkQQl.js';
import { b as broadcastManager } from './broadcast-9kcRiMZG.js';
import { g as getOperationalDateUTC, p as parseIsoDateUTC, i as isWeekendUTC } from './plantTime-CjpO2xUR.js';
import { i as isFinishArea } from './finishStations-QwGVDWOY.js';
import { s as slugSegment } from './capturePath-R_tTjP2G.js';
import { s as settleTransitFailures } from './transitFailures-C8J3UDGQ.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { r as redirect, i as isRedirect } from './index-CRFfcpCQ.js';
import { ObjectId } from 'mongodb';
import './shared-server-9-2j12mp.js';
import './plantAreas-CXYWu3iK.js';
import './pieceLevel-C7Coi6am.js';
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
		const stationDocs = await db.collection("STATIONS").find({ PROCESS: processName }, { projection: {
			MACHINE: 1,
			AREA: 1
		} }).toArray();
		machineName = resolveMachine(machine, stationDocs.map((row) => row.MACHINE).filter(Boolean));
		const currentStation = stationDocs.find((row) => row.MACHINE === machineName);
		const stationFinish = currentStation ? isFinishArea(currentStation.AREA) : url.searchParams.get("area") === "finish";
		const processSlug = slugSegment(processName);
		const machineSlug = slugSegment(machineName);
		const areaOnUrl = url.searchParams.get("area") === "finish";
		if (processSlug && params.process !== processSlug || machineSlug && params.machine !== machineSlug || currentStation && stationFinish !== areaOnUrl) {
			const next = new URL(url);
			if (stationFinish) next.searchParams.set("area", "finish");
			else next.searchParams.delete("area");
			redirect(currentStation && stationFinish !== areaOnUrl ? 307 : 301, `/capture/${processSlug}/${machineSlug}${next.search}`);
		}
		const visibleNames = [...new Set(stationDocs.filter((row) => isFinishArea(row.AREA) === stationFinish && row.MACHINE).map((row) => row.MACHINE))];
		await settleTransitFailures(db);
		const [rawLogs, transitLogs, failureDocs, allParts, allRates] = await Promise.all([
			db.collection("OEES").find({
				MACHINE: machineName,
				OEEDATE: selectedDateUTC
			}).sort({ DATETIME: 1 }).toArray(),
			db.collection("TRANSIT_FAILURES").find({
				MACHINE: machineName,
				OEEDATE: selectedDateUTC
			}).project({
				IDENTIFIER: 1,
				DISPLAY_ID: 1,
				PRODUCED: 1,
				DURATION: 1,
				RATE: 1,
				PARTNUMBER: 1,
				PROCESS: 1,
				_id: 0
			}).toArray(),
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
			area: stationFinish ? "FINISH" : "BUILD",
			isSpecialDay,
			allParts: allParts.filter((part) => allRates.some((rate) => rate.PARTNUMBER === part.PARTNUMBER)),
			allRates,
			machines: visibleNames.sort((a, b) => a.localeCompare(b, void 0, {
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
			transitFailures: transitLogs,
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
			transitFailures: [],
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

const index = 16;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BDx3krBI.js')).default;
const server_id = "src/routes/capture/[process]/[machine]/+page.server.js";
const imports = ["_app/immutable/nodes/16.DUDD6zAT.js","_app/immutable/chunks/CCtCWgBe.js","_app/immutable/chunks/Bok_0LES.js","_app/immutable/chunks/z33yw4U8.js","_app/immutable/chunks/DHw-IyYA.js","_app/immutable/chunks/CuyqONxg.js","_app/immutable/chunks/atV7_vSy.js","_app/immutable/chunks/0W1dQcc4.js","_app/immutable/chunks/BilpHNV0.js","_app/immutable/chunks/DC_7dM6l.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=16-B4po-E1I.js.map
