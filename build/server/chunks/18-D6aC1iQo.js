import { c as connectDB } from './db-CJixkQQl.js';
import { B as BUILD_STREAMS } from './plantAreas-CXYWu3iK.js';
import { f as familyFilterKey } from './familyGroups-BQ0VX3ms.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/notifier/andon/+page.server.js
function sortNames(values) {
	return [...values].sort((a, b) => a.localeCompare(b, void 0, {
		numeric: true,
		sensitivity: "base"
	}));
}
var emptyCatalog = {
	processes: [],
	families: [],
	valueStreams: []
};
var load = async () => {
	try {
		const db = await connectDB();
		if (!db) return emptyCatalog;
		const [stations, items] = await Promise.all([db.collection("STATIONS").find({}, { projection: {
			PROCESS: 1,
			MACHINE: 1,
			AREA: 1,
			_id: 0
		} }).toArray(), db.collection("ITEMS").find({}, { projection: {
			FAMILY: 1,
			TYPE: 1,
			_id: 0
		} }).toArray()]);
		const byProcess = /* @__PURE__ */ new Map();
		for (const row of stations) {
			const process = String(row.PROCESS || "").trim().toUpperCase();
			const machine = String(row.MACHINE || "").trim().toUpperCase();
			if (!process || !machine) continue;
			if (!byProcess.has(process)) byProcess.set(process, /* @__PURE__ */ new Map());
			const machines = byProcess.get(process);
			const area = String(row.AREA || "BUILD").trim().toUpperCase() || "BUILD";
			const previous = machines.get(machine);
			machines.set(machine, previous && previous !== area ? "MIXED" : area);
		}
		return {
			processes: sortNames(byProcess.keys()).map((process) => {
				const machines = byProcess.get(process);
				return {
					name: process,
					machines: sortNames(machines.keys()).map((name) => ({
						name,
						area: machines.get(name)
					}))
				};
			}),
			families: sortNames(new Set(items.map((item) => String(familyFilterKey(item.FAMILY, item.TYPE) || "").trim().toUpperCase()).filter(Boolean))),
			valueStreams: Object.entries(BUILD_STREAMS).map(([name, list]) => ({
				name,
				processes: list.map((process) => process.toUpperCase())
			}))
		};
	} catch (err) {
		console.error("Andon listen catalog failed", err);
		return emptyCatalog;
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 18;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-C73vCBXb.js')).default;
const server_id = "src/routes/notifier/andon/+page.server.js";
const imports = ["_app/immutable/nodes/18.DGrJm8Ky.js","_app/immutable/chunks/rXxnW_-v.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CGvQFN8u.js","_app/immutable/chunks/BIWZrWsJ.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/CRb2kAvA.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=18-D6aC1iQo.js.map
