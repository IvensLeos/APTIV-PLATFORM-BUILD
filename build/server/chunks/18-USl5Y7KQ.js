import { g as getOperationalDateUTC, p as parseIsoDateUTC, i as isWeekendUTC } from './plantTime-C6hdc3to.js';
import { l as logLine } from './log-Dpp269sc.js';
import { c as connectDB } from './db-BvaPBFyI.js';
import { b as broadcastManager } from './broadcast-BxLMKe3z.js';
import { u as upstreamCausesFromLog } from './captureFormat-016BC2OE.js';
import { u as upstreamProcessNames } from './plantAreas-DImca8Fn.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { i as isFinishArea } from './finishStations-CqmET-3O.js';
import { s as slugSegment } from './capturePath-IwOmvXDD.js';
import { s as settleTransitFailures } from './transitFailures-CC90qmbV.js';
import { r as redirect, i as isRedirect } from './index-CRFfcpCQ.js';
import { ObjectId } from 'mongodb';
import './shifts-BYGd7DZC.js';
import './shared-server-9-2j12mp.js';
import './pieceLevel-B94ZE9fG.js';
import './index-DBqjc0Yf.js';

//#region src/routes/review/[process]/[machine]/+page.server.js
async function partsAlreadyRun(db, machineName, catalog) {
	const numbers = await db.collection("OEES").distinct("PARTNUMBER", {
		MACHINE: machineName,
		PARTNUMBER: {
			$type: "string",
			$nin: ["", "-"]
		}
	});
	const byNumber = new Map((catalog || []).map((part) => [part.PARTNUMBER, part]));
	const missing = numbers.filter((partNumber) => partNumber && !byNumber.has(partNumber));
	const fallback = /* @__PURE__ */ new Map();
	if (missing.length > 0) {
		const samples = await db.collection("OEES").aggregate([
			{ $match: {
				MACHINE: machineName,
				PARTNUMBER: { $in: missing }
			} },
			{ $sort: { DATETIME: -1 } },
			{ $group: {
				_id: "$PARTNUMBER",
				FAMILY: { $first: "$FAMILY" },
				LEVEL: { $first: "$LEVEL" },
				TYPE: { $first: "$TYPE" }
			} }
		]).toArray();
		for (const sample of samples) fallback.set(sample._id, sample);
	}
	return numbers.filter((partNumber) => partNumber && partNumber !== "-").map((partNumber) => {
		const known = byNumber.get(partNumber);
		if (known) return known;
		const sample = fallback.get(partNumber);
		return {
			PARTNUMBER: partNumber,
			FAMILY: sample?.FAMILY || "N/A",
			LEVEL: sample?.LEVEL || "N/A",
			TYPE: sample?.TYPE || "N/A"
		};
	}).sort((a, b) => String(a.PARTNUMBER).localeCompare(String(b.PARTNUMBER)));
}
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
		const earlierProcesses = upstreamProcessNames(processName, stationFinish ? "FINISH" : "BUILD");
		const processSlug = slugSegment(processName);
		const machineSlug = slugSegment(machineName);
		const areaOnUrl = url.searchParams.get("area") === "finish";
		if (processSlug && params.process !== processSlug || machineSlug && params.machine !== machineSlug || currentStation && stationFinish !== areaOnUrl) {
			const next = new URL(url);
			if (stationFinish) next.searchParams.set("area", "finish");
			else next.searchParams.delete("area");
			redirect(currentStation && stationFinish !== areaOnUrl ? 307 : 301, `/review/${processSlug}/${machineSlug}${next.search}`);
		}
		const visibleNames = [...new Set(stationDocs.filter((row) => isFinishArea(row.AREA) === stationFinish && row.MACHINE).map((row) => row.MACHINE))];
		await settleTransitFailures(db);
		const [rawLogs, transitLogs, failureDocs, allParts, allRates, upstreamLogs] = await Promise.all([
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
			}).toArray(),
			earlierProcesses.length ? db.collection("OEES").find({
				OEEDATE: selectedDateUTC,
				PROCESS: { $in: earlierProcesses },
				TIME_LOST: { $gt: 0 }
			}).project({
				IDENTIFIER: 1,
				DISPLAY_ID: 1,
				MACHINE: 1,
				PROCESS: 1,
				FAMILY: 1,
				TYPE: 1,
				TIME_LOST: 1,
				TIME_LOST_COMMENT: 1,
				_id: 0
			}).toArray() : Promise.resolve([])
		]);
		await broadcastManager.ready();
		const liveAndonState = broadcastManager.getActiveState(machineName);
		const ratedParts = allParts.filter((part) => allRates.some((rate) => rate.PARTNUMBER === part.PARTNUMBER));
		const partsFromHistory = ratedParts.length === 0;
		const selectableParts = partsFromHistory ? await partsAlreadyRun(db, machineName, allParts) : ratedParts;
		return {
			processName,
			machineName,
			area: stationFinish ? "FINISH" : "BUILD",
			isSpecialDay,
			partsFromHistory,
			allParts: selectableParts,
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
			upstreamFailures: upstreamLogs.flatMap(upstreamCausesFromLog),
			serverAndonState: liveAndonState ? {
				isActive: true,
				level: liveAndonState.level,
				failureCode: liveAndonState.failureCode,
				station: liveAndonState.station || "",
				process: liveAndonState.process || ""
			} : {
				isActive: false,
				level: 0,
				failureCode: "",
				station: "",
				process: ""
			}
		};
	} catch (error) {
		if (isRedirect(error)) throw error;
		console.error(logLine("review", "carga fallida", {
			process: processName,
			machine: machineName,
			date: selectedDateUTC.toISOString().slice(0, 10),
			area: url.searchParams.get("area") === "finish" ? "FINISH" : "BUILD",
			collections: "OEES,TRANSIT_FAILURES,STATIONS,FAILURECODES,ITEMS,RATES"
		}), error);
		return {
			logs: [],
			transitFailures: [],
			machines: [],
			failureCodes: [],
			upstreamFailures: [],
			allParts: [],
			allRates: [],
			partsFromHistory: false,
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
		console.error(logLine("review", "intervalo no guardado", {
			collection: "OEES",
			id,
			timeLost,
			failureCode
		}), err);
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

const index = 18;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BrwWKBvh.js')).default;
const server_id = "src/routes/review/[process]/[machine]/+page.server.js";
const imports = ["_app/immutable/nodes/18.f7vMySoT.js","_app/immutable/chunks/edX-DyEE.js","_app/immutable/chunks/Cjd6MTfx.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/B3ztgD9B.js","_app/immutable/chunks/LlHMmW_j.js","_app/immutable/chunks/DJtW1GKF.js","_app/immutable/chunks/BdF4nNdE.js","_app/immutable/chunks/CNN20Oai.js","_app/immutable/chunks/DbvupxTN.js","_app/immutable/chunks/DDnyBIma.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=18-USl5Y7KQ.js.map
