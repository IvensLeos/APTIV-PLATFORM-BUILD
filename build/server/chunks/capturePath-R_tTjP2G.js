//#region src/lib/capturePath.js
/** Segmento de URL estable: minúsculas, sin espacios ni caracteres codificados. */
function slugSegment(value) {
	return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function captureHref(processName, machineName, date) {
	const process = slugSegment(processName);
	const path = machineName ? `/capture/${process}/${slugSegment(machineName)}` : `/capture/${process}`;
	if (!date) return path;
	return `${path}?date=${encodeURIComponent(date)}`;
}

export { captureHref as c, slugSegment as s };
//# sourceMappingURL=capturePath-R_tTjP2G.js.map
