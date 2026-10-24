//#region src/lib/partConversion.js
/** OEES.PARTNUMBER: exactamente 8 dígitos. DK562080 y similares no entran al catálogo. */
var OEES_PARTNUMBER = /^[0-9]{8}$/;
function isOeesPartNumber(value) {
	return OEES_PARTNUMBER.test(String(value ?? "").trim());
}
/**
* @param {string} serverPart
* @param {string} realPart
* @param {string | null | undefined} existingReal null/undefined = la llave no está en PART_CONVERSIONS
*/
function describeConversion(serverPart, realPart, existingReal) {
	const serverOk = isOeesPartNumber(serverPart);
	const realOk = isOeesPartNumber(realPart);
	if (!serverOk || !realOk) return {
		status: "rejected",
		reason: !serverOk && !realOk ? "ERP part and real part must be exactly 8 digits." : !realOk ? "Real part must be exactly 8 digits." : "ERP part must be exactly 8 digits."
	};
	if (existingReal === void 0 || existingReal === null || existingReal === "") return {
		status: "new",
		reason: "Not in PART_CONVERSIONS yet."
	};
	if (String(existingReal).trim() === String(realPart).trim()) return {
		status: "same",
		reason: "Already in PART_CONVERSIONS."
	};
	return {
		status: "conflict",
		reason: `Catalog currently has ${String(existingReal).trim()}.`
	};
}

export { describeConversion as d, isOeesPartNumber as i };
//# sourceMappingURL=partConversion-NydKHFLM.js.map
