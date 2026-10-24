import { c as connectDB } from './db-CJixkQQl.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/taxonomy/+page.server.js
var load = async () => {
	try {
		const db = await connectDB();
		const since = /* @__PURE__ */ new Date();
		since.setUTCDate(since.getUTCDate() - 21);
		since.setUTCHours(0, 0, 0, 0);
		const recentPart = {
			OEEDATE: { $gte: since },
			PARTNUMBER: { $nin: [
				null,
				"",
				"—",
				"UNKNOWN"
			] }
		};
		const [items, rates, conversions, machines, activeOeeParts, activeOeeCombinations] = await Promise.all([
			db.collection("ITEMS").find({}).sort({ PARTNUMBER: 1 }).toArray(),
			db.collection("RATES").find({}).sort({
				MACHINE: 1,
				PARTNUMBER: 1
			}).toArray(),
			db.collection("PART_CONVERSIONS").find({}).sort({ SERVER_PARTNUMBER: 1 }).toArray(),
			db.collection("STATIONS").distinct("MACHINE", { MACHINE: { $nin: [null, ""] } }),
			db.collection("OEES").distinct("PARTNUMBER", recentPart),
			db.collection("OEES").aggregate([
				{ $match: {
					...recentPart,
					MACHINE: { $nin: [
						null,
						"",
						"UNKNOWN"
					] }
				} },
				{ $group: {
					_id: {
						PARTNUMBER: "$PARTNUMBER",
						MACHINE: "$MACHINE"
					},
					totalLost: { $sum: "$TIME_LOST" }
				} },
				{ $sort: { totalLost: -1 } },
				{ $limit: 300 }
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
				if (!partNumber) return fail(400, { error: "Part number is required." });
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
				if (!partNumber || !machine) return fail(400, { error: "Part number and machine are required." });
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
				if (!serverPart || !serverProcess || !realPart) return fail(400, { error: "ERP mapping is incomplete." });
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
			return fail(500, { error: `Could not save: ${err.message}` });
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
			return fail(500, { error: `Database error: ${err.message}` });
		}
	},
	bulkImportTaxonomy: async ({ request }) => {
		const formData = await request.formData();
		const target = formData.get("targetCollection")?.toString();
		let records = [];
		try {
			records = JSON.parse(formData.get("jsonData")?.toString() || "[]");
		} catch {
			return fail(400, { error: "The CSV could not be read." });
		}
		if (!Array.isArray(records) || records.length === 0) return fail(400, { error: "The CSV has no rows." });
		if (records.length > 5e3) return fail(400, { error: "Import 5000 rows or fewer at a time." });
		const db = await connectDB();
		const text = (value) => String(value || "").trim().toUpperCase();
		try {
			if (target === "ITEMS") {
				const ops = records.map((row) => {
					const partNumber = text(row.PARTNUMBER);
					if (!partNumber) return null;
					return { updateOne: {
						filter: { PARTNUMBER: partNumber },
						update: { $set: {
							PARTNUMBER: partNumber,
							FAMILY: text(row.FAMILY) || "UNASSIGNED",
							TYPE: text(row.TYPE) || "RADAR",
							LEVEL: text(row.LEVEL) || "MODULE"
						} },
						upsert: true
					} };
				}).filter(Boolean);
				if (ops.length) await db.collection("ITEMS").bulkWrite(ops, { ordered: false });
			} else if (target === "RATES") {
				const ops = records.map((row) => {
					const partNumber = text(row.PARTNUMBER);
					const machine = text(row.MACHINE);
					if (!partNumber || !machine) return null;
					return { updateOne: {
						filter: {
							PARTNUMBER: partNumber,
							MACHINE: machine
						},
						update: { $set: {
							PARTNUMBER: partNumber,
							MACHINE: machine,
							RATE: Math.max(0, parseInt(row.RATE, 10) || 0)
						} },
						upsert: true
					} };
				}).filter(Boolean);
				if (ops.length) await db.collection("RATES").bulkWrite(ops, { ordered: false });
			} else if (target === "CONVERSIONS") {
				const ops = records.map((row) => {
					const serverPart = text(row.SERVER_PARTNUMBER);
					const serverProcess = text(row.SERVER_PROCESS);
					const realPart = text(row.REAL_PARTNUMBER);
					if (!serverPart || !serverProcess || !realPart) return null;
					return { updateOne: {
						filter: {
							SERVER_PARTNUMBER: serverPart,
							SERVER_PROCESS: serverProcess
						},
						update: { $set: {
							SERVER_PARTNUMBER: serverPart,
							SERVER_PROCESS: serverProcess,
							REAL_PARTNUMBER: realPart
						} },
						upsert: true
					} };
				}).filter(Boolean);
				if (ops.length) await db.collection("PART_CONVERSIONS").bulkWrite(ops, { ordered: false });
			} else return fail(400, { error: "Unknown catalog." });
			return { success: true };
		} catch (err) {
			return fail(500, { error: `Import failed: ${err.message}` });
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
const component = async () => component_cache ??= (await import('./_page.svelte-CUDFfDB_.js')).default;
const server_id = "src/routes/admin/taxonomy/+page.server.js";
const imports = ["_app/immutable/nodes/12.CNvNOyhc.js","_app/immutable/chunks/CnGhWSQv.js","_app/immutable/chunks/BI8b8DQr.js","_app/immutable/chunks/CdUwCJJQ.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/16QF5fYH.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=12-BVxqkzXd.js.map
