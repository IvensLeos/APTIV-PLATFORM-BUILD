import { c as connectDB } from './db-W1d6-Une.js';
import { g as getOperationalDateUTC, p as parseIsoDateUTC } from './plantTime-D8u-b8Pp.js';
import './private-C3tFArXN.js';
import 'mongodb';

//#region src/routes/+page.server.js
var load = async ({ url }) => {
	const startOfOpDayUTC = getOperationalDateUTC();
	const selectedDate = parseIsoDateUTC(url.searchParams.get("date")) || startOfOpDayUTC;
	const streams = {
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
		]
	};
	try {
		const logs = (await (await connectDB()).collection("OEES").find({ OEEDATE: selectedDate }).sort({ DATETIME: -1 }).toArray()).map((l) => ({
			...l,
			_id: l._id.toString(),
			PRODUCED: Number(l.PRODUCED) || 0,
			RATE: Number(l.RATE) || 0,
			TIME_LOST: Number(l.TIME_LOST) || 0,
			PROCESS: l.PROCESS || "UNKNOWN",
			TYPE: l.TYPE || "UNKNOWN",
			FAMILY: l.FAMILY || "UNKNOWN",
			DISPLAY_ID: l.DISPLAY_ID || "",
			TIME_LOST_COMMENT: l.TIME_LOST_COMMENT || ""
		}));
		return {
			logs,
			streams,
			familyMapping: {
				RADAR: [...new Set(logs.filter((l) => l.TYPE === "RADAR").map((l) => l.FAMILY))],
				CONTROLLER: [...new Set(logs.filter((l) => l.TYPE === "CONTROLLER").map((l) => l.FAMILY))]
			},
			selectedDate: selectedDate.toISOString().split("T")[0],
			isReadOnly: selectedDate.getTime() !== startOfOpDayUTC.getTime()
		};
	} catch (e) {
		return {
			logs: [],
			streams,
			familyMapping: {
				RADAR: [],
				CONTROLLER: []
			},
			isReadOnly: true
		};
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CYEZZWBo.js')).default;
const server_id = "src/routes/+page.server.js";
const imports = ["_app/immutable/nodes/2.DGAMYNJ3.js","_app/immutable/chunks/D3yo-TEn.js","_app/immutable/chunks/pNTMqyZV.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/DvW0sOxX.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/DBux3O3E.js","_app/immutable/chunks/wsXWVRrq.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=2-BhpUTIKE.js.map
