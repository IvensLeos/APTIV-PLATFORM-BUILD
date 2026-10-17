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
	MODULE: 2
};
function normalizeLevel(level) {
	const name = String(level || "").trim().toUpperCase();
	if (name === "RAWBOARD" || name === "RAW BOARD") return "RAW BOARD";
	if (name === "BOARD") return "BOARD";
	if (name === "MODULE") return "MODULE";
	return "";
}
function expectedLevel(type, process) {
	const step = String(process || "").trim().toUpperCase();
	if (step === "LASER ETCH") return "RAW BOARD";
	if ((BOARD_PROCESSES[type] || ["SMT", "XRAY"]).includes(step)) return "BOARD";
	return "MODULE";
}
/** A board (or raw board) reported at a process that already expects the next level. */
function isFailureTransit(log) {
	const actual = normalizeLevel(log?.LEVEL);
	if (!actual) return false;
	const expected = expectedLevel(log?.TYPE, log?.PROCESS);
	return LEVEL_RANK[actual] < LEVEL_RANK[expected];
}

export { isFailureTransit as i, normalizeLevel as n };
//# sourceMappingURL=pieceLevel-CBxHKy7o.js.map
