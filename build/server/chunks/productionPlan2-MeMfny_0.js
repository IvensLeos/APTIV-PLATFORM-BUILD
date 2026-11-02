import { B as BUILD_STREAMS } from './plantAreas-CXYWu3iK.js';

//#region src/lib/productionPlan.js
/** Daily production plan. One file feeds Build and Finish. Station counts stay in OEES. */
var HEADER_ALIASES = {
	family: ["FAMILY"],
	packingPn: [
		"PACKING PARTNUMBER",
		"PACKING NUMBER",
		"PACKING PN",
		"PACKING PART"
	],
	modulePn: [
		"MODULE",
		"MODULE PN",
		"PARTNUMBER",
		"PART NUMBER"
	],
	smtPart: ["SMT PART", "SMT PN"],
	planModule: ["PLAN MODULE", "PLAN MOD"],
	planBracket: ["PLAN BRACKET", "PLAN BRK"]
};
function planKey(isoDate) {
	return `PLAN_${isoDate}`;
}
/** Blank and a dash mean "no figure". */
function parsePlanNumber(raw) {
	const text = String(raw ?? "").trim();
	if (!text || text === "-" || text === "—" || text === "–") return null;
	const negative = /^\(.*\)$/.test(text);
	const digits = text.replace(/[(),%\s]/g, "").replace(/,/g, "");
	if (!digits) return null;
	const value = Number(digits);
	if (!Number.isFinite(value)) return null;
	return Math.round(negative ? -Math.abs(value) : value);
}
function splitLine(line, delimiter) {
	const cells = [];
	let current = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === "\"") if (quoted && line[i + 1] === "\"") {
			current += "\"";
			i++;
		} else quoted = !quoted;
		else if (char === delimiter && !quoted) {
			cells.push(current.trim());
			current = "";
		} else current += char;
	}
	cells.push(current.trim());
	return cells;
}
function normalizeHeader(value) {
	return String(value || "").toUpperCase().replace(/%/g, "").replace(/\s+/g, " ").trim();
}
function headerIndexes(headers) {
	const normalized = headers.map(normalizeHeader);
	const indexes = {};
	for (const [key, names] of Object.entries(HEADER_ALIASES)) indexes[key] = normalized.findIndex((header) => names.includes(header));
	return indexes;
}
function cell(cols, index) {
	if (index == null || index < 0) return "";
	return cols[index] ?? "";
}
/**
* Radar plan file: PACKING PARTNUMBER, MODULE, PLAN MODULE, PLAN BRACKET.
* PLAN is always PLAN MODULE + PLAN BRACKET. Family and SMT part are optional.
*/
function parseProductionPlanCsv(rawText) {
	const lines = String(rawText || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
	if (!lines.length) return [];
	const delimiter = lines[0].includes("	") ? "	" : ",";
	const table = lines.map((line) => splitLine(line, delimiter));
	const headered = table[0].some((value) => /[A-Za-z]/.test(value));
	const indexes = headered ? headerIndexes(table[0]) : null;
	if (headered && indexes.packingPn < 0) return [];
	const body = headered ? table.slice(1) : table;
	const rows = /* @__PURE__ */ new Map();
	for (const cols of body) {
		const packingPn = String(indexes ? cell(cols, indexes.packingPn) : cols[0] || "").trim().toUpperCase();
		const modulePn = String(indexes ? cell(cols, indexes.modulePn) : cols[1] || "").trim();
		if (!/^\d{5,}(?:-\d+)?$/.test(packingPn) || !/^\d{5,}$/.test(modulePn)) continue;
		const planModule = parsePlanNumber(indexes ? cell(cols, indexes.planModule) : cols[2]) || 0;
		const planBracket = parsePlanNumber(indexes ? cell(cols, indexes.planBracket) : cols[3]) || 0;
		rows.set(packingPn, {
			packingPn,
			modulePn,
			family: indexes ? cell(cols, indexes.family) : "",
			smtPart: indexes ? cell(cols, indexes.smtPart).replace(/\D/g, "") : "",
			planModule,
			planBracket,
			planTotal: planModule + planBracket
		});
	}
	return [...rows.values()];
}
/** Build shows one row per module. The plan is the sum of its packing lines. */
function groupPlanByModule(rows) {
	const grouped = /* @__PURE__ */ new Map();
	for (const row of rows || []) {
		const modulePn = String(row.modulePn || "").trim();
		if (!modulePn) continue;
		if (!grouped.has(modulePn)) grouped.set(modulePn, {
			...row,
			modulePn,
			planModule: 0,
			planBracket: 0,
			planTotal: 0,
			packingPns: []
		});
		const bucket = grouped.get(modulePn);
		bucket.planModule += Number(row.planModule) || 0;
		bucket.planBracket += Number(row.planBracket) || 0;
		bucket.planTotal += Number(row.planTotal) || 0;
		if (row.packingPn) bucket.packingPns.push(row.packingPn);
		if (!bucket.smtPart && row.smtPart) bucket.smtPart = row.smtPart;
		if (!bucket.laserPart && row.laserPart) bucket.laserPart = row.laserPart;
		if (!bucket.family && row.family) bucket.family = row.family;
	}
	return [...grouped.values()];
}
/** Red at 0, amber on the way, green once the plan is met or a later process already met it. */
function planHeat(ratio, covered) {
	if (covered || ratio >= 1) return {
		background: "#15803d",
		color: "#ffffff"
	};
	const t = Math.max(0, Math.min(1, Number(ratio) || 0));
	const from = [
		185,
		28,
		28
	];
	const to = [
		217,
		119,
		6
	];
	return {
		background: `rgb(${from.map((channel, index) => Math.round(channel + (to[index] - channel) * t)).join(",")})`,
		color: t > .55 ? "#1a1a1a" : "#ffffff"
	};
}
/**
* The last process that met the plan covers every process before it.
* A process does not have to reach the plan when a later one already did.
* Meeting the plan does not cover the processes that come after.
*/
function planPace(quantities, plan, labels) {
	const target = Number(plan) || 0;
	const met = quantities.map((qty) => target > 0 && qty >= target);
	let bossIndex = -1;
	for (let index = quantities.length - 1; index >= 0; index--) if (met[index]) {
		bossIndex = index;
		break;
	}
	const boss = bossIndex >= 0 ? labels[bossIndex] || "" : "";
	return quantities.map((qty, index) => {
		const ratio = target > 0 ? qty / target : 0;
		const covered = met[index] || bossIndex > index;
		let title = target > 0 ? `${Math.round(ratio * 100)}% of plan` : "No plan";
		if (met[index]) title = "Met the plan";
		else if (bossIndex > index) title = `Covered by ${boss}`;
		return {
			qty,
			ratio,
			covered,
			heat: planHeat(ratio, covered),
			title
		};
	});
}
/** Radar build, first to last. Laser is the raw board; SMT and X-ray are the SMT part; the rest is the module. */
var RADAR_BUILD_PROCESSES = [
	{
		key: "laser",
		label: "LASER",
		servers: ["BOARD_LABEL"],
		process: "LASER ETCH",
		part: "laser",
		area: "build"
	},
	{
		key: "smt",
		label: "SMT",
		servers: ["SPI_S1", "SPI_S2"],
		process: "SMT",
		part: "board",
		area: "build"
	},
	{
		key: "xray",
		label: "XRAY",
		servers: ["XRAY"],
		process: "XRAY",
		part: "board",
		area: "build"
	},
	{
		key: "programming",
		label: "PROGRAMMING",
		servers: ["MOL", "PROGRAMMING"],
		process: "PROGRAMMING",
		part: "module",
		area: "build"
	},
	{
		key: "edgebond",
		label: "EDGEBOND",
		servers: ["EDGEBONDAOI"],
		process: "EDGEBOND",
		part: "module",
		area: "build"
	},
	{
		key: "router",
		label: "ROUTER",
		servers: ["ROUTERMILLING"],
		process: "ROUTERMILLING",
		part: "module",
		area: "build"
	},
	{
		key: "antenna",
		label: "ANTENNA",
		servers: ["ANTENNAATTACH"],
		process: "ANTENNA ATTACH",
		part: "module",
		area: "build"
	},
	{
		key: "leaktest",
		label: "LEAKTEST",
		servers: ["LEAKTEST"],
		process: "LEAKTEST",
		part: "module",
		area: "build"
	}
];
/** Radar finish, first to last. Counts are the module, one row per packing part number. */
var RADAR_FINISH_PROCESSES = [{
	key: "functional",
	label: "FUNCTIONAL",
	servers: ["FUNCTIONAL"],
	process: "FUNCTIONAL",
	part: "module",
	area: "finish"
}, {
	key: "packing",
	label: "PACKING",
	servers: ["PACKING", "PACK"],
	process: "PACKING",
	part: "module",
	area: "finish"
}];
var RADAR_PROCESS_CHAIN = [...RADAR_BUILD_PROCESSES, ...RADAR_FINISH_PROCESSES];

//#region src/lib/server/productionPlan.js
/**
* Family and stream come from the module in ITEMS.
* SMT part: SPI_S2 wins over SPI_S1. Laser part: BOARD_LABEL of that SMT part, the raw the laser actually marks.
*/
async function enrichProductionPlan(db, rows, fallbackType = "") {
	const source = Array.isArray(rows) ? rows : [];
	const modulePns = [...new Set(source.map((row) => String(row?.modulePn || "").trim()).filter(Boolean))];
	if (!modulePns.length) return [];
	const [items, conversions] = await Promise.all([db.collection("ITEMS").find({ PARTNUMBER: { $in: modulePns } }).project({
		_id: 0,
		PARTNUMBER: 1,
		FAMILY: 1,
		TYPE: 1,
		LEVEL: 1
	}).toArray(), db.collection("PART_CONVERSIONS").find({
		SERVER_PARTNUMBER: { $in: modulePns },
		SERVER_PROCESS: { $in: ["SPI_S1", "SPI_S2"] }
	}).project({
		_id: 0,
		SERVER_PARTNUMBER: 1,
		SERVER_PROCESS: 1,
		REAL_PARTNUMBER: 1
	}).toArray()]);
	const itemByPart = new Map(items.map((item) => [String(item.PARTNUMBER || "").trim(), item]));
	const spiS1 = /* @__PURE__ */ new Map();
	const spiS2 = /* @__PURE__ */ new Map();
	for (const row of conversions) {
		const server = String(row.SERVER_PARTNUMBER || "").trim();
		const real = String(row.REAL_PARTNUMBER || "").trim();
		if (!server || !real) continue;
		if (row.SERVER_PROCESS === "SPI_S2") spiS2.set(server, real);
		if (row.SERVER_PROCESS === "SPI_S1") spiS1.set(server, real);
	}
	const drafted = source.map((row) => {
		const modulePn = String(row.modulePn || "").trim();
		return {
			modulePn,
			item: itemByPart.get(modulePn),
			smtPart: spiS2.get(modulePn) || spiS1.get(modulePn) || String(row.smtPart || "").replace(/\D/g, ""),
			row
		};
	});
	const smtParts = [...new Set(drafted.map((entry) => entry.smtPart).filter(Boolean))];
	const laserRows = smtParts.length ? await db.collection("PART_CONVERSIONS").find({
		SERVER_PROCESS: "BOARD_LABEL",
		SERVER_PARTNUMBER: { $in: smtParts }
	}).project({
		_id: 0,
		SERVER_PARTNUMBER: 1,
		REAL_PARTNUMBER: 1
	}).toArray() : [];
	const laserBySmt = new Map(laserRows.map((row) => [String(row.SERVER_PARTNUMBER || "").trim(), String(row.REAL_PARTNUMBER || "").trim()]));
	const stream = BUILD_STREAMS[fallbackType] ? fallbackType : "";
	return drafted.map(({ modulePn, item, smtPart, row }) => ({
		packingPn: String(row.packingPn || modulePn).trim().toUpperCase(),
		modulePn,
		family: item?.FAMILY || String(row.family || "").trim(),
		type: item?.TYPE || (BUILD_STREAMS[row.type] ? row.type : "") || stream,
		level: item?.LEVEL || "MODULE",
		smtPart,
		laserPart: laserBySmt.get(smtPart) || String(row.laserPart || "").trim(),
		planModule: Number(row.planModule) || 0,
		planBracket: Number(row.planBracket) || 0,
		planTotal: (Number(row.planModule) || 0) + (Number(row.planBracket) || 0) || Number(row.planTotal) || 0
	}));
}

export { RADAR_PROCESS_CHAIN as R, parseProductionPlanCsv as a, planPace as b, enrichProductionPlan as e, groupPlanByModule as g, planKey as p };
//# sourceMappingURL=productionPlan2-MeMfny_0.js.map
