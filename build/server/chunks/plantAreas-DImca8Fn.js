//#region src/lib/plantAreas.js
/** Build is the board route already on the dashboard. Finish is final test and pack. */
var BUILD_STREAMS = {
	RADAR: [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"PROGRAMMING",
		"EDGEBOND",
		"ROUTERMILLING",
		"ANTENNA ATTACH",
		"LEAKTEST"
	],
	CONTROLLER: [
		"LASER ETCH",
		"SMT",
		"PTH",
		"XRAY",
		"PROGRAMMING",
		"EDGEBOND",
		"CONFORMAL",
		"SCREWDRIVE"
	],
	CAMERA: [
		"LASER ETCH",
		"SMT",
		"UNDERFILL",
		"PTH",
		"ICT"
	],
	"MRR ADAS": [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"SINGULATION",
		"ICT",
		"MOL",
		"LGA CONTAINMENT"
	],
	IFV300: [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"SINGULATION",
		"ICT",
		"MOL"
	],
	"VOLVO DHU": [
		"LASER ETCH",
		"SMT",
		"PTH",
		"XRAY",
		"ROUTERMILLING",
		"ICT"
	],
	IFV600: [
		"LASER ETCH",
		"SMT",
		"PTH",
		"XRAY",
		"PROGRAMMING",
		"ICT"
	],
	"VOLVO VIU": [
		"LASER ETCH",
		"SMT",
		"XRAY"
	],
	"GM DMS": [
		"LASER ETCH",
		"SMT",
		"XRAY",
		"ICT"
	]
};
/**
* Finish routes by value stream. Other streams stay empty until their route is known.
* The first step consumes what the last build step released.
* A name that also exists in Build, such as routermilling, stays Build unless the
* station or the row is marked AREA FINISH.
*/
var FINISH_ROUTES = { CAMERA: [
	"ROUTERMILLING",
	"ACTIVE ALIGN",
	"OVEN",
	"INTRINSICCAL",
	"EOL",
	"CMI",
	"PACK"
] };
var FINISH_ROUTE = [...new Set(Object.values(FINISH_ROUTES).flat())];
FINISH_ROUTES.CAMERA[0];
/**
* Level a finish step expects. Camera final test starts on the board released by ICT,
* so a board at those steps is good production, not a failure in transit.
*/
var FINISH_EXPECTED_LEVEL = {
	ROUTERMILLING: "MODULE",
	"ACTIVE ALIGN": "MODULE",
	OVEN: "MODULE",
	INTRINSICCAL: "MODULE",
	EOL: "MODULE",
	CMI: "MODULE",
	PACK: "MODULE"
};
var BUILD_LEVELS = [
	"RAW BOARD",
	"BOARD",
	"MODULE"
];
var FINISH_LEVELS = [
	"BOARD",
	"MODULE",
	"TESTED",
	"PACKED"
];
var PIECE_LEVELS = [
	"RAW BOARD",
	"BOARD",
	"MODULE",
	"TESTED",
	"PACKED"
];
var FINISH_PROCESS_SET = new Set(FINISH_ROUTE);
var BUILD_PROCESS_SET = new Set(Object.values(BUILD_STREAMS).flat());
var RADAR_PREFIXES = [
	[/^SRR FORD\b/i, 0],
	[/^MRR FORD\b/i, 1],
	[/^SRR FCA\b/i, 2],
	[/^MRR FCA\b/i, 3],
	[/^KIA\b/i, 4],
	[/^NISSAN\b/i, 5],
	[/^(RIVIAN|SRR THUNDER|FLR4 THUNDER)\b/i, 6]
];
var LIST_ORDER = {
	CONTROLLER: [
		[/^ECU\b/i, 0],
		[/^CADM LOW\b/i, 1],
		[/^CADM MID\b/i, 2],
		[/^CADM MAP\b/i, 3],
		[/^CADM\b/i, 4]
	],
	CAMERA: [
		[/^52 DEGREES CAMERA\b/i, 0],
		[/^100 DEGREES OMNIVISION\b/i, 2],
		[/^100 DEGREES CAMERA\b/i, 1]
	],
	IFV300: [[/^IFV300 MAIN\b/i, 0], [/^IFV300 CAMERA\b/i, 1]],
	IFV600: [[/^IFV600 MAIN\b/i, 0], [/^IFV600 CAMERA\b/i, 1]],
	"GM DMS": [[/^GM DMS ECU\b/i, 0], [/^GM DMS CAMERA\b/i, 1]],
	"VOLVO VIU": [[/^VOLVO VIU C\b/i, 0], [/^VOLVO VIU F\b/i, 1]]
};
function normalizeProcessName(process) {
	return String(process || "").trim().toUpperCase();
}
function isFinishProcess(process) {
	return FINISH_PROCESS_SET.has(normalizeProcessName(process));
}
function isBuildProcess(process) {
	return BUILD_PROCESS_SET.has(normalizeProcessName(process));
}
function finishRouteFor(type) {
	return FINISH_ROUTES[String(type || "").trim().toUpperCase()] || [];
}
/** Processes that sit before this step on any route of the active area. Finish does not look back into Build. */
function upstreamProcessNames(processName, area) {
	const step = normalizeProcessName(processName);
	const routes = String(area).trim().toUpperCase() === "FINISH" ? Object.values(FINISH_ROUTES) : Object.values(BUILD_STREAMS);
	const names = /* @__PURE__ */ new Set();
	for (const route of routes) {
		const index = route.findIndex((name) => normalizeProcessName(name) === step);
		if (index > 0) for (const name of route.slice(0, index)) names.add(name);
	}
	return [...names];
}
function finishExpectedLevel(type, process) {
	const step = normalizeProcessName(process);
	const stream = String(type || "").trim().toUpperCase();
	if (stream === "CAMERA" && finishRouteFor(stream).includes(step)) return "BOARD";
	return FINISH_EXPECTED_LEVEL[step] || "MODULE";
}
/**
* AREA wins when the row is marked. A name that exists only in Finish is Finish.
* A shared name, such as routermilling, stays Build until the row says AREA FINISH.
*/
function logArea(log) {
	const marked = String(log?.AREA || "").trim().toUpperCase();
	if (marked === "FINISH" || marked === "BUILD") return marked;
	const name = normalizeProcessName(log?.PROCESS);
	if (isFinishProcess(name) && !isBuildProcess(name)) return "FINISH";
	return "BUILD";
}
/** Inserts each finish route and tags it with its value stream. Existing rows are updated in place. */
async function ensureFinishProcesses(db) {
	const collection = db.collection("PROCESSES");
	await collection.createIndex({
		AREA: 1,
		TYPE: 1,
		ORDER: 1
	}, { name: "idx_processes_area_type_order" });
	const writes = [];
	for (const [type, steps] of Object.entries(FINISH_ROUTES)) steps.forEach((name, index) => {
		writes.push({ updateOne: {
			filter: { _id: `FINISH:${name}` },
			update: {
				$set: {
					AREA: "FINISH",
					TYPE: type,
					PROCESS: name,
					ORDER: index
				},
				$setOnInsert: { createdAt: /* @__PURE__ */ new Date() }
			},
			upsert: true
		} });
	});
	if (writes.length) await collection.bulkWrite(writes);
	const rows = await collection.find({ AREA: "FINISH" }).sort({
		ORDER: 1,
		PROCESS: 1
	}).toArray();
	const routes = {};
	for (const row of rows) {
		const type = row.TYPE || "CAMERA";
		if (!row.PROCESS) continue;
		if (!routes[type]) routes[type] = [];
		routes[type].push(row.PROCESS);
	}
	const names = FINISH_ROUTE.filter((name) => Object.values(routes).some((steps) => steps.includes(name)));
	for (const steps of Object.values(routes)) for (const name of steps) if (!names.includes(name)) names.push(name);
	return {
		routes: Object.keys(routes).length ? routes : structuredClone(FINISH_ROUTES),
		names: names.length ? names : [...FINISH_ROUTE]
	};
}
/** Last build step this family actually runs. That output feeds the delivery bridge. */
function buildExitProcess(type, family) {
	const steps = BUILD_STREAMS[type];
	if (!steps?.length) return "";
	const name = String(family || "");
	if (type === "IFV300" && /^IFV300 CAMERA\b/i.test(name)) return "SINGULATION";
	if (type === "IFV600" && /^IFV600 MAIN\b/i.test(name)) return "PROGRAMMING";
	if (type === "IFV600" && /^IFV600 CAMERA\b/i.test(name)) return "ICT";
	if (type === "GM DMS" && /^GM DMS ECU\b/i.test(name)) return "SMT";
	return steps[steps.length - 1];
}
/** Shared raw-board pools stay in Build. They are not a finish family. */
function isBoardPoolFamily(family) {
	return /\bBOARD\b/i.test(String(family || "").trim());
}
function compareFamilyNames(type, a, b) {
	const left = String(a || "");
	const right = String(b || "");
	const rules = type === "RADAR" ? RADAR_PREFIXES : LIST_ORDER[type];
	const rank = (name) => {
		if (!rules) return 99;
		const found = rules.find(([test]) => test.test(name));
		return found ? found[1] : rules.length;
	};
	return rank(left) - rank(right) || left.localeCompare(right, "en");
}

export { BUILD_STREAMS as B, FINISH_ROUTE as F, PIECE_LEVELS as P, FINISH_ROUTES as a, isBuildProcess as b, isBoardPoolFamily as c, buildExitProcess as d, ensureFinishProcesses as e, finishExpectedLevel as f, FINISH_LEVELS as g, BUILD_LEVELS as h, isFinishProcess as i, compareFamilyNames as j, logArea as l, normalizeProcessName as n, upstreamProcessNames as u };
//# sourceMappingURL=plantAreas-DImca8Fn.js.map
