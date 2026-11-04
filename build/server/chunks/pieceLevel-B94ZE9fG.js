import { i as isFinishProcess, f as finishExpectedLevel } from './plantAreas-DImca8Fn.js';

//#region src/lib/pieceLevel.js
var BOARD_PROCESSES = {
	CONTROLLER: [
		"SMT",
		"PTH",
		"XRAY"
	],
	"VOLVO DHU": [
		"SMT",
		"PTH",
		"XRAY",
		"ROUTERMILLING",
		"ICT"
	],
	"MRR ADAS": [
		"SMT",
		"XRAY",
		"ICT"
	],
	IFV300: [
		"SMT",
		"XRAY",
		"ICT"
	],
	IFV600: [
		"SMT",
		"PTH",
		"XRAY",
		"ICT"
	],
	"GM DMS": [
		"SMT",
		"XRAY",
		"ICT"
	],
	CAMERA: [
		"SMT",
		"UNDERFILL",
		"PTH",
		"ICT"
	]
};
var LEVEL_RANK = {
	"RAW BOARD": 0,
	BOARD: 1,
	MODULE: 2,
	TESTED: 3,
	PACKED: 4
};
function normalizeLevel(level) {
	const name = String(level || "").trim().toUpperCase();
	if (name === "RAWBOARD" || name === "RAW BOARD") return "RAW BOARD";
	if (name === "BOARD") return "BOARD";
	if (name === "MODULE") return "MODULE";
	if (name === "TESTED") return "TESTED";
	if (name === "PACKED") return "PACKED";
	return "";
}
function expectedLevel(type, process) {
	const step = String(process || "").trim().toUpperCase();
	if (isFinishProcess(step)) return finishExpectedLevel(type, step);
	if (step === "LASER ETCH") return "RAW BOARD";
	if ((BOARD_PROCESSES[type] || ["SMT", "XRAY"]).includes(step)) return "BOARD";
	return "MODULE";
}
/** Misma llave que FAILURE_RULES: número de parte + proceso. */
function levelRuleKey(part, process) {
	return `${String(part || "").trim()}|${String(process || "").trim().toUpperCase()}`;
}
function isAcceptedLevel(log, accepted) {
	if (!accepted || !log) return false;
	const key = levelRuleKey(log.PARTNUMBER, log.PROCESS);
	if (accepted instanceof Set) return accepted.has(key);
	return Array.isArray(accepted) && accepted.includes(key);
}
/** A board (or raw board) reported at a process that already expects the next level. */
function isFailureTransit(log, accepted) {
	if (isAcceptedLevel(log, accepted)) return false;
	const actual = normalizeLevel(log?.LEVEL);
	if (!actual) return false;
	const expected = expectedLevel(log?.TYPE, log?.PROCESS);
	return LEVEL_RANK[actual] < LEVEL_RANK[expected];
}

export { expectedLevel as e, isFailureTransit as i, levelRuleKey as l, normalizeLevel as n };
//# sourceMappingURL=pieceLevel-B94ZE9fG.js.map
