import { r as requireRole } from './access-CAyZvWwC.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { F as FINISH_ROUTE, B as BUILD_STREAMS } from './plantAreas-CXYWu3iK.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/rates/+page.server.js
var PART = /^[0-9]{8}$/;
var MACHINE = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,78}$/;
var MAX_RATE = 1e5;
var MAX_MACHINES = 40;
var PROCESS_ORDER = [];
for (const step of [...Object.values(BUILD_STREAMS).flat(), ...FINISH_ROUTE]) if (!PROCESS_ORDER.includes(step)) PROCESS_ORDER.push(step);
var text$1 = (value) => String(value ?? "").trim();
function dayKey(value) {
	if (!value) return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}
function natural(a, b) {
	return a.localeCompare(b, void 0, {
		numeric: true,
		sensitivity: "base"
	});
}
function processRank(name) {
	const index = PROCESS_ORDER.indexOf(name);
	return index === -1 ? PROCESS_ORDER.length : index;
}
function readEntries(raw) {
	let parsed;
	try {
		parsed = JSON.parse(text$1(raw) || "[]");
	} catch {
		return { error: "The rate list could not be read." };
	}
	if (!Array.isArray(parsed) || parsed.length === 0) return { error: "Choose at least one machine." };
	if (parsed.length > MAX_MACHINES) return { error: "Too many machines in one save." };
	const byMachine = /* @__PURE__ */ new Map();
	for (const entry of parsed) {
		const machine = text$1(entry?.machine);
		const rate = Number(entry?.rate);
		if (!MACHINE.test(machine)) return { error: "A machine name is not valid." };
		if (!Number.isInteger(rate) || rate < 1 || rate > MAX_RATE) return { error: "A rate must be a whole number of pieces per hour, from 1 up." };
		byMachine.set(machine, rate);
	}
	return { entries: [...byMachine.entries()].map(([machine, rate]) => ({
		machine,
		rate
	})) };
}
var load = async ({ locals }) => {
	requireRole(locals, ["SUPERVISOR", "ADMIN"]);
	try {
		const db = await connectDB();
		const [stations, rates, items, rolled] = await Promise.all([
			db.collection("STATIONS").find({}).project({
				MACHINE: 1,
				PROCESS: 1,
				AREA: 1
			}).toArray(),
			db.collection("RATES").find({}).project({
				PARTNUMBER: 1,
				MACHINE: 1,
				RATE: 1
			}).toArray(),
			db.collection("ITEMS").find({}).project({
				PARTNUMBER: 1,
				FAMILY: 1,
				TYPE: 1,
				LEVEL: 1
			}).toArray(),
			db.collection("OEES").aggregate([
				{ $match: {
					PARTNUMBER: { $nin: [
						null,
						"",
						"UNKNOWN",
						"—"
					] },
					MACHINE: { $nin: [
						null,
						"",
						"UNKNOWN"
					] }
				} },
				{ $project: {
					PARTNUMBER: 1,
					MACHINE: 1,
					PROCESS: 1,
					FAMILY: 1,
					TYPE: 1,
					DURATION: 1,
					PRODUCED: 1,
					OEEDATE: 1
				} },
				{ $facet: {
					evidence: [{ $group: {
						_id: {
							PARTNUMBER: "$PARTNUMBER",
							MACHINE: "$MACHINE"
						},
						intervals: { $sum: 1 },
						family: { $first: "$FAMILY" },
						process: { $first: "$PROCESS" },
						type: { $first: "$TYPE" }
					} }],
					benchmarks: [{ $match: {
						DURATION: 60,
						PRODUCED: { $gt: 0 }
					} }, { $group: {
						_id: {
							PARTNUMBER: "$PARTNUMBER",
							MACHINE: "$MACHINE"
						},
						samples: { $sum: 1 },
						family: { $first: "$FAMILY" },
						process: { $first: "$PROCESS" },
						type: { $first: "$TYPE" },
						top: { $topN: {
							n: 10,
							sortBy: {
								PRODUCED: -1,
								OEEDATE: -1
							},
							output: {
								produced: "$PRODUCED",
								day: "$OEEDATE"
							}
						} }
					} }]
				} }
			], { allowDiskUse: true }).toArray()
		]);
		const stationOf = /* @__PURE__ */ new Map();
		const machinesByProcess = /* @__PURE__ */ new Map();
		const addMachine = (process, machine, area) => {
			if (!machinesByProcess.has(process)) machinesByProcess.set(process, /* @__PURE__ */ new Map());
			const bucket = machinesByProcess.get(process);
			if (!bucket.has(machine)) bucket.set(machine, area);
		};
		for (const station of stations) {
			const machine = text$1(station.MACHINE);
			const process = text$1(station.PROCESS);
			if (!machine || !process || stationOf.has(machine)) continue;
			const area = station.AREA === "FINISH" ? "FINISH" : "BUILD";
			stationOf.set(machine, {
				process,
				area
			});
			addMachine(process, machine, area);
		}
		const itemOf = new Map(items.map((item) => [text$1(item.PARTNUMBER), item]));
		const rateOf = /* @__PURE__ */ new Map();
		for (const rate of rates) {
			const part = text$1(rate.PARTNUMBER);
			const machine = text$1(rate.MACHINE);
			if (!part || !machine) continue;
			const value = Number(rate.RATE);
			rateOf.set(`${part}|${machine}`, value > 0 ? value : null);
		}
		const evidence = /* @__PURE__ */ new Map();
		for (const row of rolled[0]?.evidence || []) {
			const part = text$1(row._id?.PARTNUMBER);
			const machine = text$1(row._id?.MACHINE);
			if (!part || !machine) continue;
			evidence.set(`${part}|${machine}`, {
				intervals: Number(row.intervals) || 0,
				family: text$1(row.family),
				process: text$1(row.process),
				type: text$1(row.type)
			});
		}
		const keys = new Set([...evidence.keys(), ...rateOf.keys()]);
		const grouped = /* @__PURE__ */ new Map();
		for (const key of keys) {
			const [part, machine] = key.split("|");
			const seen = evidence.get(key);
			const station = stationOf.get(machine);
			const process = station?.process || seen?.process || "UNKNOWN";
			const area = station?.area || "BUILD";
			if (!station) addMachine(process, machine, area);
			const item = itemOf.get(part);
			const groupKey = `${part}|${process}`;
			if (!grouped.has(groupKey)) grouped.set(groupKey, {
				part,
				process,
				area,
				family: text$1(item?.FAMILY) || seen?.family || "UNKNOWN",
				type: text$1(item?.TYPE) || seen?.type || "",
				level: text$1(item?.LEVEL),
				machines: []
			});
			grouped.get(groupKey).machines.push({
				machine,
				rate: rateOf.has(key) ? rateOf.get(key) : null,
				intervals: seen?.intervals || 0
			});
		}
		return {
			groups: [...grouped.values()].map((group) => ({
				...group,
				machines: group.machines.sort((a, b) => natural(a.machine, b.machine))
			})).sort((a, b) => processRank(a.process) - processRank(b.process) || natural(a.family, b.family) || natural(a.part, b.part)),
			catalog: [...machinesByProcess.entries()].map(([process, machines]) => {
				const areas = [...new Set(machines.values())];
				return {
					process,
					area: areas.length === 1 ? areas[0] : "MIXED",
					machines: [...machines.entries()].sort((a, b) => natural(a[0], b[0])).map(([machine, area]) => ({
						machine,
						area
					}))
				};
			}).sort((a, b) => processRank(a.process) - processRank(b.process) || natural(a.process, b.process)),
			benchmarks: (rolled[0]?.benchmarks || []).map((row) => {
				const part = text$1(row._id?.PARTNUMBER);
				const machine = text$1(row._id?.MACHINE);
				const station = stationOf.get(machine);
				const item = itemOf.get(part);
				const top = (row.top || []).map((point) => ({
					produced: Math.round(Number(point.produced) || 0),
					day: dayKey(point.day)
				})).filter((point) => point.produced > 0);
				const sum = top.reduce((total, point) => total + point.produced, 0);
				const average = top.length ? Math.round(sum / top.length * 10) / 10 : 0;
				return {
					part,
					machine,
					process: station?.process || text$1(row.process) || "UNKNOWN",
					area: station?.area || "BUILD",
					family: text$1(item?.FAMILY) || text$1(row.family) || "UNKNOWN",
					type: text$1(item?.TYPE) || text$1(row.type) || "",
					samples: Number(row.samples) || top.length,
					top,
					average,
					suggested: top.length ? Math.max(1, Math.round(sum / top.length)) : 0,
					rate: rateOf.has(`${part}|${machine}`) ? rateOf.get(`${part}|${machine}`) : null
				};
			}).filter((row) => row.part && row.machine && row.top.length)
		};
	} catch (error) {
		console.error("Rates load failed:", error);
		return {
			groups: [],
			catalog: [],
			benchmarks: [],
			error: "Rates could not be loaded."
		};
	}
};
var actions = {
	saveRates: async ({ request, locals }) => {
		requireRole(locals, ["SUPERVISOR", "ADMIN"]);
		const formData = await request.formData();
		const part = text$1(formData.get("part"));
		if (!PART.test(part)) return fail(400, { error: "Part number must be 8 digits." });
		const parsed = readEntries(formData.get("entries"));
		if (parsed.error) return fail(400, { error: parsed.error });
		try {
			await (await connectDB()).collection("RATES").bulkWrite(parsed.entries.map(({ machine, rate }) => ({ updateOne: {
				filter: {
					PARTNUMBER: part,
					MACHINE: machine
				},
				update: { $set: {
					PARTNUMBER: part,
					MACHINE: machine,
					RATE: rate
				} },
				upsert: true
			} })), { ordered: false });
			return {
				saved: parsed.entries.length,
				part
			};
		} catch (error) {
			return fail(500, { error: `Could not save the rates: ${error.message}` });
		}
	},
	removeRate: async ({ request, locals }) => {
		requireRole(locals, ["SUPERVISOR", "ADMIN"]);
		const formData = await request.formData();
		const part = text$1(formData.get("part"));
		const machine = text$1(formData.get("machine"));
		if (!PART.test(part) || !MACHINE.test(machine)) return fail(400, { error: "Part and machine are required." });
		try {
			return {
				removed: (await (await connectDB()).collection("RATES").deleteMany({
					PARTNUMBER: part,
					MACHINE: machine
				})).deletedCount,
				part,
				machine
			};
		} catch (error) {
			return fail(500, { error: `Could not remove the rate: ${error.message}` });
		}
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Cq3naKdf.js')).default;
const server_id = "src/routes/admin/rates/+page.server.js";
const imports = ["_app/immutable/nodes/9.7sLm2Rse.js","_app/immutable/chunks/rXxnW_-v.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/BVlUgpB-.js","_app/immutable/chunks/CGvQFN8u.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=9-SirnB7Lt.js.map
