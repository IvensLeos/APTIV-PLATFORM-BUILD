//#region src/lib/familyGroups.js
var ECU_BOX = /^ECU BOX ([A-Z])\b/i;
var CADM_MID = /^CADM MID\b/i;
var CADM_MAP = /^CADM MAP\b/i;
function familyFilterKey(family, type, serverProcess) {
	const name = family || "UNKNOWN";
	let key = name;
	if (!type || type === "CONTROLLER") if (/\bBOARD$/i.test(name)) key = name;
	else {
		const box = String(name).match(ECU_BOX);
		if (box) key = `ECU BOX ${box[1].toUpperCase()}`;
		else if (CADM_MID.test(name)) key = "CADM MID";
		else if (CADM_MAP.test(name)) key = "CADM MAP";
	}
	if (String(serverProcess || "").includes("SPI_S2")) return `${key} (2)`;
	return key;
}
function familyMatchesFilter(family, filter, type, serverProcess) {
	return true;
}

export { familyMatchesFilter as a, familyFilterKey as f };
//# sourceMappingURL=familyGroups-BQ0VX3ms.js.map
