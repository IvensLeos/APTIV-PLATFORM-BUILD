import { c as connectDB } from './db-CJixkQQl.js';
import { p as parseIsoDateUTC, g as getOperationalDateUTC, i as isWeekendUTC, o as SHIFT_IDS, f as getShiftAtMinutes } from './plantTime-CjpO2xUR.js';
import { i as isFinishProcess, b as isBuildProcess } from './plantAreas-DImca8Fn.js';
import { i as isFinishArea } from './finishStations-CqmET-3O.js';
import { s as slugSegment } from './capturePath-R_tTjP2G.js';
import { n as netExpected, p as programmedMinutes } from './downtime-Cgg3eN_G.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { r as redirect } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/capture/[process]/+page.server.js
var load = async ({ params, url }) => {
	const processName = params.process.toUpperCase().replace(/-/g, " ");
	const canonical = slugSegment(processName);
	if (canonical && params.process !== canonical) redirect(301, `/capture/${canonical}${url.search}`);
	const db = await connectDB();
	const stationDocs = await db.collection("STATIONS").find({ PROCESS: processName }, { projection: {
		MACHINE: 1,
		AREA: 1
	} }).toArray();
	const wantsFinish = url.searchParams.get("area") === "finish" || isFinishProcess(processName) && !isBuildProcess(processName);
	const names = [...new Set(stationDocs.filter((row) => isFinishArea(row.AREA) === wantsFinish).map((row) => row.MACHINE).filter(Boolean))];
	const dateUTC = parseIsoDateUTC(url.searchParams.get("date")) || getOperationalDateUTC();
	const selectedDate = dateUTC.toISOString().split("T")[0];
	const holidayPromise = isHoliday(db, selectedDate);
	const machineStats = await db.collection("STATIONS").aggregate([
		{ $match: {
			PROCESS: processName,
			MACHINE: { $in: names }
		} },
		{ $group: {
			_id: "$MACHINE",
			stations: { $addToSet: "$STATION" }
		} },
		{ $lookup: {
			from: "OEES",
			let: { machineName: "$_id" },
			pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$MACHINE", "$$machineName"] }, { $eq: ["$OEEDATE", dateUTC] }] } } }, { $sort: { DATETIME: -1 } }],
			as: "allDayRecords"
		} },
		{ $project: {
			name: "$_id",
			stations: 1,
			currentServerProcess: { $ifNull: [{ $arrayElemAt: ["$allDayRecords.SERVER_PROCESS", 0] }, "N/A"] },
			currentFamily: { $ifNull: [{ $arrayElemAt: ["$allDayRecords.FAMILY", 0] }, "NO DATA"] },
			produced: { $sum: "$allDayRecords.PRODUCED" },
			expected: { $sum: "$allDayRecords.RATE" },
			intervals: { $map: {
				input: "$allDayRecords",
				as: "r",
				in: {
					minutes: { $add: [{ $multiply: [{ $ifNull: [{ $hour: "$$r.DATETIME" }, 0] }, 60] }, { $ifNull: [{ $minute: "$$r.DATETIME" }, 0] }] },
					produced: { $ifNull: ["$$r.PRODUCED", 0] },
					expected: { $ifNull: ["$$r.RATE", 0] },
					duration: { $ifNull: ["$$r.DURATION", 0] },
					timeLost: { $ifNull: ["$$r.TIME_LOST", 0] },
					comment: "$$r.TIME_LOST_COMMENT"
				}
			} },
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
		} },
		{ $project: { pendingRecords: 0 } }
	]).toArray();
	const isSpecialDay = isWeekendUTC(dateUTC) || await holidayPromise;
	return {
		processName,
		selectedDate,
		area: wantsFinish ? "FINISH" : "BUILD",
		machines: JSON.parse(JSON.stringify(machineStats)).map((row) => {
			const { intervals, ...rest } = row;
			const rated = (intervals || []).map((interval) => ({
				minutes: interval.minutes,
				produced: interval.produced,
				expected: netExpected({
					RATE: interval.expected,
					DURATION: interval.duration,
					TIME_LOST: interval.timeLost,
					TIME_LOST_COMMENT: interval.comment
				})
			}));
			const programmed = (intervals || []).reduce((sum, interval) => sum + programmedMinutes({
				RATE: interval.expected,
				DURATION: interval.duration,
				TIME_LOST: interval.timeLost,
				TIME_LOST_COMMENT: interval.comment
			}), 0);
			return {
				...rest,
				expected: rated.reduce((sum, interval) => sum + interval.expected, 0),
				programmedMinutes: programmed,
				shifts: shiftsFor(rated, isSpecialDay),
				stations: [...new Set(row.stations || [])].filter(Boolean).sort()
			};
		}).sort((a, b) => {
			const typeA = a.name.split(" ")[0];
			const typeB = b.name.split(" ")[0];
			if (typeA === typeB) return extractNumber(a.name) - extractNumber(b.name);
			return typeA.localeCompare(typeB);
		})
	};
};
function shiftsFor(intervals, isSpecialDay) {
	const buckets = Object.fromEntries(SHIFT_IDS.map((id) => [id, {
		produced: 0,
		expected: 0,
		count: 0
	}]));
	for (const row of intervals || []) {
		const bucket = buckets[getShiftAtMinutes(Number(row.minutes) || 0, isSpecialDay)];
		if (!bucket) continue;
		bucket.produced += Number(row.produced) || 0;
		bucket.expected += Number(row.expected) || 0;
		bucket.count += 1;
	}
	return SHIFT_IDS.map((id) => {
		const bucket = buckets[id];
		return {
			id,
			hasData: bucket.count > 0,
			efficiency: bucket.expected > 0 ? Math.round(bucket.produced / bucket.expected * 100) : 0
		};
	});
}
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
const component = async () => component_cache ??= (await import('./_page.svelte-C47yu42A.js')).default;
const server_id = "src/routes/capture/[process]/+page.server.js";
const imports = ["_app/immutable/nodes/14.CuCmdxXm.js","_app/immutable/chunks/DwgLNQjb.js","_app/immutable/chunks/CDvQ_eSY.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/ekNJv7IX.js","_app/immutable/chunks/D8mGzBBg.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=14-D_ws22Vq.js.map
