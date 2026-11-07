//#region src/lib/capturePath.js
/** Segmento de URL estable: minúsculas, sin espacios ni caracteres codificados. */
function slugSegment(value) {
	return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function reviewHref(processName, machineName, date) {
	const process = slugSegment(processName);
	const path = machineName ? `/review/${process}/${slugSegment(machineName)}` : `/review/${process}`;
	if (!date) return path;
	return `${path}?date=${encodeURIComponent(date)}`;
}

export { reviewHref as r, slugSegment as s };
//# sourceMappingURL=capturePath-IwOmvXDD.js.map
