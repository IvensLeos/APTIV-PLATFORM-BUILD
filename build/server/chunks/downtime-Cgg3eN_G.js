//#region src/lib/downtime.js
/** PD- is programmed downtime. Those minutes are outside the production base. */
function isProgrammedCode(code) {
	return /^PD-/i.test(String(code || "").trim());
}
/** Coded splits on an interval. A plain string covers the whole TIME_LOST. */
function codedLosses(log) {
	const lost = Math.max(0, Number(log?.TIME_LOST) || 0);
	const comment = log?.TIME_LOST_COMMENT;
	if (Array.isArray(comment)) return comment.map((entry) => ({
		code: String(entry?.code || "").trim(),
		minutes: Math.max(0, Number(entry?.minutes) || 0)
	})).filter((entry) => entry.code && entry.minutes > 0);
	const code = String(comment || "").trim();
	if (!code || lost <= 0) return [];
	return [{
		code,
		minutes: lost
	}];
}
/** Programmed minutes, never more than the interval's lost time. */
function programmedMinutes(log) {
	const lost = Math.max(0, Number(log?.TIME_LOST) || 0);
	if (lost <= 0) return 0;
	const programmed = codedLosses(log).filter((entry) => isProgrammedCode(entry.code)).reduce((sum, entry) => sum + entry.minutes, 0);
	return Math.min(lost, programmed);
}
/** Lost minutes that still count: failures, free text, and time with no code. */
function unplannedMinutes(log) {
	const lost = Math.max(0, Number(log?.TIME_LOST) || 0);
	return Math.max(0, lost - programmedMinutes(log));
}
function piecesFor(log, minutes) {
	const duration = Number(log?.DURATION) || 0;
	const rate = Number(log?.RATE) || 0;
	if (duration <= 0 || rate <= 0 || minutes <= 0) return 0;
	return rate / duration * Math.min(minutes, duration);
}
/** Pieces the interval rate assigned to programmed minutes. */
function programmedPieces(log) {
	return piecesFor(log, programmedMinutes(log));
}
/** Pieces the interval rate assigned to unplanned lost time. */
function unplannedPieces(log) {
	return piecesFor(log, unplannedMinutes(log));
}
/** Expected pieces after programmed downtime leaves the base. */
function netExpected(log) {
	const rate = Number(log?.RATE) || 0;
	return Math.max(0, rate - programmedPieces(log));
}
/** none | programmed | failure | mixed. Drives the capture colors. */
function lossKind(log) {
	const lost = Math.max(0, Number(log?.TIME_LOST) || 0);
	if (lost <= 0) return "none";
	const programmed = programmedMinutes(log);
	if (programmed <= 0) return "failure";
	if (programmed >= lost) return "programmed";
	return "mixed";
}

export { unplannedPieces as a, codedLosses as c, isProgrammedCode as i, lossKind as l, netExpected as n, programmedMinutes as p, unplannedMinutes as u };
//# sourceMappingURL=downtime-Cgg3eN_G.js.map
