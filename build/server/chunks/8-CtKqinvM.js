import { c as connectDB } from './db-W1d6-Une.js';
import './private-C3tFArXN.js';
import 'mongodb';

//#region src/routes/admin/mapping/+page.server.js
var load = async ({ url }) => {
	const dateParam = url.searchParams.get("date");
	const queryDate = dateParam ? /* @__PURE__ */ new Date(`${dateParam}T00:00:00.000Z`) : /* @__PURE__ */ new Date();
	if (!dateParam) queryDate.setUTCHours(0, 0, 0, 0);
	return { gaps: (await (await connectDB()).collection("OEES").aggregate([
		{ $match: {
			OEEDATE: queryDate,
			$or: [
				{ MACHINE: "UNKNOWN" },
				{ FAMILY: "UNKNOWN" },
				{ RATE: 0 }
			]
		} },
		{ $lookup: {
			from: "RATES",
			let: {
				p: "$PARTNUMBER",
				m: "$MACHINE"
			},
			pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$PARTNUMBER", "$$p"] }, { $eq: ["$MACHINE", "$$m"] }] } } }],
			as: "masterRate"
		} },
		{ $lookup: {
			from: "ITEMS",
			localField: "PARTNUMBER",
			foreignField: "PARTNUMBER",
			as: "masterItem"
		} },
		{ $lookup: {
			from: "STATIONS",
			localField: "STATION",
			foreignField: "STATION",
			as: "masterStation"
		} },
		{ $addFields: {
			masterRate: { $map: {
				input: "$masterRate",
				as: "r",
				in: { $mergeObjects: ["$$r", { _id: { $toString: "$$r._id" } }] }
			} },
			masterItem: { $map: {
				input: "$masterItem",
				as: "i",
				in: { $mergeObjects: ["$$i", { _id: { $toString: "$$i._id" } }] }
			} },
			masterStation: { $map: {
				input: "$masterStation",
				as: "s",
				in: { $mergeObjects: ["$$s", { _id: { $toString: "$$s._id" } }] }
			} }
		} },
		{ $match: { $or: [
			{ masterRate: { $size: 0 } },
			{ masterItem: { $size: 0 } },
			{ masterStation: { $size: 0 } }
		] } },
		{ $sort: { DATETIME: -1 } }
	]).toArray()).map((g) => ({
		...g,
		_id: g._id.toString()
	})) };
};
var actions = {
	saveItem: async ({ request }) => {
		const data = await request.formData();
		await (await connectDB()).collection("ITEMS").updateOne({ PARTNUMBER: data.get("partNumber") }, { $set: {
			PARTNUMBER: data.get("partNumber"),
			FAMILY: data.get("family").toUpperCase(),
			TYPE: data.get("type").toUpperCase(),
			LEVEL: data.get("level").toUpperCase()
		} }, { upsert: true });
		return {
			success: true,
			message: "Item Mapped"
		};
	},
	saveStation: async ({ request }) => {
		const data = await request.formData();
		await (await connectDB()).collection("STATIONS").updateOne({ STATION: data.get("station") }, { $set: {
			STATION: data.get("station"),
			MACHINE: data.get("machine").toUpperCase(),
			PROCESS: data.get("process").toUpperCase()
		} }, { upsert: true });
		return {
			success: true,
			message: "Station Mapped"
		};
	},
	saveRate: async ({ request }) => {
		const data = await request.formData();
		await (await connectDB()).collection("RATES").updateOne({
			PARTNUMBER: data.get("partNumber"),
			MACHINE: data.get("machine")
		}, { $set: {
			PARTNUMBER: data.get("partNumber"),
			MACHINE: data.get("machine"),
			RATE: Number(data.get("rate"))
		} }, { upsert: true });
		return {
			success: true,
			message: "Rate Set"
		};
	},
	syncLogs: async () => {
		const db = await connectDB();
		const [stations, items, rates] = await Promise.all([
			db.collection("STATIONS").find({}).toArray(),
			db.collection("ITEMS").find({}).toArray(),
			db.collection("RATES").find({}).toArray()
		]);
		const stationsMap = Object.fromEntries(stations.map((s) => [s.STATION, s]));
		const itemsMap = Object.fromEntries(items.map((i) => [i.PARTNUMBER, i]));
		const ratesMap = Object.fromEntries(rates.map((r) => [`${r.PARTNUMBER}_${r.MACHINE}`, r.RATE]));
		const logsToFix = await db.collection("OEES").find({ $or: [
			{ MACHINE: "UNKNOWN" },
			{ FAMILY: "UNKNOWN" },
			{ RATE: 0 }
		] }).toArray();
		if (logsToFix.length === 0) return {
			success: true,
			updated: 0
		};
		const bulkOps = logsToFix.map((log) => {
			const sInfo = stationsMap[log.STATION] || {};
			const iInfo = itemsMap[log.PARTNUMBER] || {};
			const machineName = sInfo.MACHINE || log.MACHINE;
			const masterRate = ratesMap[`${log.PARTNUMBER}_${machineName}`] || 0;
			const finalRate = masterRate > 0 ? Math.floor(masterRate / 60 * log.DURATION) : 0;
			return { updateOne: {
				filter: { _id: log._id },
				update: { $set: {
					MACHINE: machineName,
					PROCESS: sInfo.PROCESS || log.PROCESS,
					FAMILY: iInfo.FAMILY || log.FAMILY,
					TYPE: iInfo.TYPE || log.TYPE,
					LEVEL: iInfo.LEVEL || log.LEVEL,
					RATE: finalRate,
					UPDATED_AT: /* @__PURE__ */ new Date()
				} }
			} };
		});
		return {
			success: true,
			updated: (await db.collection("OEES").bulkWrite(bulkOps)).modifiedCount
		};
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 8;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-B3Y7ttCK.js')).default;
const server_id = "src/routes/admin/mapping/+page.server.js";
const imports = ["_app/immutable/nodes/8.CAPec66n.js","_app/immutable/chunks/BMd-Mghi.js","_app/immutable/chunks/YSkIBHS_.js","_app/immutable/chunks/991LZ9Z8.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/DK6yFgsL.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=8-CtKqinvM.js.map
