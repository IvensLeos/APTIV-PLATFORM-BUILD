import { n as normalizeProcessName } from './plantAreas-CXYWu3iK.js';

//#region src/lib/server/finishStations.js
function isFinishArea(value) {
	return String(value || "").trim().toUpperCase() === "FINISH";
}
function stationKey(process, machine) {
	return `${normalizeProcessName(process)}|${String(machine || "").trim().toUpperCase()}`;
}
async function finishStationKeys(db) {
	const rows = await db.collection("STATIONS").find({}, { projection: {
		PROCESS: 1,
		MACHINE: 1,
		AREA: 1
	} }).toArray();
	const keys = /* @__PURE__ */ new Set();
	for (const row of rows) {
		if (!isFinishArea(row.AREA)) continue;
		keys.add(stationKey(row.PROCESS, row.MACHINE));
	}
	return keys;
}
/** A finish station marks the row even when the OEES document has no AREA. */
function stampFinishArea(log, keys) {
	const marked = String(log?.AREA || "").trim().toUpperCase();
	if (marked === "FINISH" || marked === "BUILD") return marked;
	if (keys?.has(stationKey(log?.PROCESS, log?.MACHINE))) return "FINISH";
	return "";
}

export { finishStationKeys as f, isFinishArea as i, stampFinishArea as s };
//# sourceMappingURL=finishStations-QwGVDWOY.js.map
