import { c as connectDB } from './db-W1d6-Une.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './private-C3tFArXN.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/taxonomy/+page.server.js
var load = async () => {
	try {
		const db = await connectDB();
		const [items, rates, conversions, machines, activeOeeParts, activeOeeCombinations] = await Promise.all([
			db.collection("ITEMS").find({}).sort({ PARTNUMBER: 1 }).toArray(),
			db.collection("RATES").find({}).sort({
				MACHINE: 1,
				PARTNUMBER: 1
			}).toArray(),
			db.collection("PART_CONVERSIONS").find({}).sort({ SERVER_PARTNUMBER: 1 }).toArray(),
			db.collection("STATIONS").distinct("MACHINE", { MACHINE: {
				$ne: null,
				$ne: ""
			} }),
			db.collection("OEES").distinct("PARTNUMBER", { PARTNUMBER: {
				$ne: "—",
				$ne: null
			} }),
			db.collection("OEES").aggregate([
				{ $match: {
					PARTNUMBER: { $ne: "—" },
					MACHINE: { $ne: "UNKNOWN" }
				} },
				{ $group: {
					_id: {
						PARTNUMBER: "$PARTNUMBER",
						MACHINE: "$MACHINE"
					},
					totalLost: { $sum: "$TIME_LOST" }
				} },
				{ $sort: { totalLost: -1 } }
			]).toArray()
		]);
		const mappedItemsSet = new Set(items.map((i) => i.PARTNUMBER));
		const gapTaxonomy = activeOeeParts.filter((pn) => !mappedItemsSet.has(pn.toUpperCase()));
		const mappedRatesKeys = new Set(rates.map((r) => `${r.PARTNUMBER}|${r.MACHINE}`));
		const gapRates = activeOeeCombinations.filter((c) => !mappedRatesKeys.has(`${c._id.PARTNUMBER}|${c._id.MACHINE}`)).map((c) => ({
			PARTNUMBER: c._id.PARTNUMBER,
			MACHINE: c._id.MACHINE,
			lostMinutes: c.totalLost
		}));
		return {
			items: items.map((i) => ({
				id: i._id.toString(),
				PARTNUMBER: i.PARTNUMBER,
				FAMILY: i.FAMILY,
				TYPE: i.TYPE || "RADAR",
				LEVEL: i.LEVEL || "MODULE"
			})),
			rates: rates.map((r) => ({
				id: r._id.toString(),
				PARTNUMBER: r.PARTNUMBER,
				MACHINE: r.MACHINE,
				RATE: Number(r.RATE) || 0
			})),
			conversions: conversions.map((c) => ({
				id: c._id.toString(),
				SERVER_PARTNUMBER: c.SERVER_PARTNUMBER,
				SERVER_PROCESS: c.SERVER_PROCESS,
				REAL_PARTNUMBER: c.REAL_PARTNUMBER
			})),
			machines: machines.sort(),
			gaps: {
				taxonomy: gapTaxonomy,
				rates: gapRates
			}
		};
	} catch (error) {
		return {
			items: [],
			rates: [],
			conversions: [],
			machines: [],
			gaps: {
				taxonomy: [],
				rates: []
			},
			error: error.message
		};
	}
};
var actions = {
	/**
	* Persistencia Inline Unificada con control de integridad empresarial
	*/
	saveRow: async ({ request }) => {
		const formData = await request.formData();
		const mode = formData.get("mode")?.toString();
		const db = await connectDB();
		try {
			if (mode === "ITEM") {
				const partNumber = formData.get("partNumber")?.toString().trim().toUpperCase();
				const family = formData.get("family")?.toString().trim().toUpperCase() || "UNASSIGNED";
				const type = formData.get("type")?.toString().trim().toUpperCase() || "RADAR";
				const level = formData.get("level")?.toString().trim().toUpperCase() || "MODULE";
				if (!partNumber) return fail(400, { error: "Clave primaria de número de parte requerida." });
				await db.collection("ITEMS").updateOne({ PARTNUMBER: partNumber }, { $set: {
					PARTNUMBER: partNumber,
					FAMILY: family,
					TYPE: type,
					LEVEL: level
				} }, { upsert: true });
			} else if (mode === "RATE") {
				const partNumber = formData.get("partNumber")?.toString().trim().toUpperCase();
				const machine = formData.get("machine")?.toString().trim().toUpperCase();
				const rateValue = parseInt(formData.get("rate")?.toString() || "0", 10);
				if (!partNumber || !machine) return fail(400, { error: "Identificadores de máquina y número de parte requeridos." });
				await db.collection("RATES").updateOne({
					PARTNUMBER: partNumber,
					MACHINE: machine
				}, { $set: {
					PARTNUMBER: partNumber,
					MACHINE: machine,
					RATE: Math.max(0, rateValue)
				} }, { upsert: true });
			} else if (mode === "CONVERSION") {
				const serverPart = formData.get("serverPartNumber")?.toString().trim().toUpperCase();
				const serverProcess = formData.get("serverProcess")?.toString().trim().toUpperCase();
				const realPart = formData.get("realPartNumber")?.toString().trim().toUpperCase();
				if (!serverPart || !serverProcess || !realPart) return fail(400, { error: "Atributos de mapeo ERP incompletos." });
				await db.collection("PART_CONVERSIONS").updateOne({
					SERVER_PARTNUMBER: serverPart,
					SERVER_PROCESS: serverProcess
				}, { $set: {
					SERVER_PARTNUMBER: serverPart,
					SERVER_PROCESS: serverProcess,
					REAL_PARTNUMBER: realPart
				} }, { upsert: true });
			}
			return { success: true };
		} catch (err) {
			return fail(500, { error: `Fallo transaccional en base de datos: ${err.message}` });
		}
	},
	/**
	* Purga controlada de catálogos maestros
	*/
	deleteRow: async ({ request }) => {
		const formData = await request.formData();
		const mode = formData.get("mode")?.toString();
		const key1 = formData.get("key1")?.toString().trim();
		const key2 = formData.get("key2")?.toString().trim();
		const db = await connectDB();
		try {
			if (mode === "ITEM") await db.collection("ITEMS").deleteOne({ PARTNUMBER: key1 });
			else if (mode === "RATE") await db.collection("RATES").deleteOne({
				PARTNUMBER: key1,
				MACHINE: key2
			});
			else if (mode === "CONVERSION") await db.collection("PART_CONVERSIONS").deleteOne({
				SERVER_PARTNUMBER: key1,
				SERVER_PROCESS: key2
			});
			return { success: true };
		} catch (err) {
			return fail(500, { error: `Error durante la eliminación del registro: ${err.message}` });
		}
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 12;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Xs47fIcN.js')).default;
const server_id = "src/routes/admin/taxonomy/+page.server.js";
const imports = ["_app/immutable/nodes/12.BqgkRKYu.js","_app/immutable/chunks/BI0V19ln.js","_app/immutable/chunks/BLtcUtIN.js","_app/immutable/chunks/991LZ9Z8.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/hEqp9PFq.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=12-CLfPvjlR.js.map
