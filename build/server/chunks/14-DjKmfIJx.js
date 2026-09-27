import { c as connectDB } from './db-W1d6-Une.js';
import { p as parseIsoDateUTC, g as getOperationalDateUTC } from './plantTime-RlOFrl7D.js';
import './private-C3tFArXN.js';
import 'mongodb';

//#region src/routes/capture/[process]/+page.server.js
var load = async ({ params, url }) => {
	const processName = params.process.toUpperCase().replace(/-/g, " ");
	const db = await connectDB();
	const dateUTC = parseIsoDateUTC(url.searchParams.get("date")) || getOperationalDateUTC();
	const selectedDate = dateUTC.toISOString().split("T")[0];
	const machineStats = await db.collection("STATIONS").aggregate([
		{ $match: { PROCESS: processName } },
		{ $group: { _id: "$MACHINE" } },
		{ $lookup: {
			from: "OEES",
			let: { machineName: "$_id" },
			pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$MACHINE", "$$machineName"] }, { $eq: ["$OEEDATE", dateUTC] }] } } }, { $sort: { DATETIME: -1 } }],
			as: "allDayRecords"
		} },
		{ $project: {
			name: "$_id",
			currentServerProcess: { $ifNull: [{ $arrayElemAt: ["$allDayRecords.SERVER_PROCESS", 0] }, "N/A"] },
			currentFamily: { $ifNull: [{ $arrayElemAt: ["$allDayRecords.FAMILY", 0] }, "NO DATA"] },
			pendingRecords: { $filter: {
				input: "$allDayRecords",
				as: "r",
				cond: { $and: [{ $gt: ["$$r.TIME_LOST", 0] }, { $let: {
					vars: {
						allocatedMinutes: { $cond: [
							{ $isArray: "$$r.TIME_LOST_COMMENT" },
							{ $reduce: {
								input: "$$r.TIME_LOST_COMMENT",
								initialValue: 0,
								in: { $add: ["$$value", { $convert: {
									input: "$$this.minutes",
									to: "int",
									onError: 0
								} }] }
							} },
							0
						] },
						commentType: { $type: "$$r.TIME_LOST_COMMENT" }
					},
					in: { $or: [
						{ $eq: ["$$commentType", "missing"] },
						{ $eq: ["$$commentType", "null"] },
						{ $and: [{ $eq: ["$$commentType", "string"] }, { $eq: [{ $trim: { input: "$$r.TIME_LOST_COMMENT" } }, ""] }] },
						{ $and: [{ $eq: ["$$commentType", "array"] }, { $lt: ["$$allocatedMinutes", "$$r.TIME_LOST"] }] }
					] }
				} }] }
			} }
		} },
		{ $addFields: {
			hasGaps: { $gt: [{ $size: "$pendingRecords" }, 0] },
			pendingCount: { $size: "$pendingRecords" }
		} }
	]).toArray();
	return {
		processName,
		selectedDate,
		machines: JSON.parse(JSON.stringify(machineStats)).sort((a, b) => {
			const typeA = a.name.split(" ")[0];
			const typeB = b.name.split(" ")[0];
			if (typeA === typeB) return extractNumber(a.name) - extractNumber(b.name);
			return typeA.localeCompare(typeB);
		})
	};
};
function extractNumber(str) {
	const match = str.match(/\d+/);
	return match ? parseInt(match[0], 10) : Infinity;
}

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 14;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BS8NLCsV.js')).default;
const server_id = "src/routes/capture/[process]/+page.server.js";
const imports = ["_app/immutable/nodes/14.Cv5dWcxS.js","_app/immutable/chunks/991LZ9Z8.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=14-DjKmfIJx.js.map
