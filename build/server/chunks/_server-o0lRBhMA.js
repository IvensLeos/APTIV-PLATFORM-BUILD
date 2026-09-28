import { c as connectDB } from './db-wxZFJtrv.js';
import { p as parseIsoDateUTC, e as getOperationalDayFor, n as isWeekendDay, k as toIsoDate, b as buildTimeline } from './plantTime-RlOFrl7D.js';
import { e as extractHourMinute } from './captureFormat-FFTiojiT.js';
import { j as json } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/volume/+server.js
var normalSlots = new Set(buildTimeline(false).map((slot) => slot.time));
var specialSlots = new Set(buildTimeline(true).map((slot) => slot.time));
function wallClock(displayId) {
	const match = String(displayId || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
	if (!match) return null;
	let hour = parseInt(match[4], 10);
	const minute = parseInt(match[5], 10);
	const period = match[6].toUpperCase();
	if (period === "PM" && hour < 12) hour += 12;
	if (period === "AM" && hour === 12) hour = 0;
	return {
		year: Number(match[3]),
		month: Number(match[1]),
		day: Number(match[2]),
		hour,
		minute
	};
}
var MAX_DAYS = 31;
async function GET({ url }) {
	const from = parseIsoDateUTC(url.searchParams.get("from"));
	const to = parseIsoDateUTC(url.searchParams.get("to"));
	if (!from || !to || from > to) return json({ error: "Invalid date range" }, { status: 400 });
	if (Math.round((to.getTime() - from.getTime()) / 864e5) + 1 > MAX_DAYS) return json({ error: "Choose a range of 31 days or less" }, { status: 400 });
	try {
		const db = await connectDB();
		const fromIso = from.toISOString().slice(0, 10);
		const toIso = to.toISOString().slice(0, 10);
		const holidayDocs = await db.collection("HOLIDAYS").find({
			key: "HOLIDAYS",
			value: {
				$gte: fromIso,
				$lte: toIso
			}
		}, { projection: { value: 1 } }).toArray();
		const holidays = new Set(holidayDocs.map((doc) => doc.value));
		const onSchedule = (displayId) => {
			const wall = wallClock(displayId);
			const token = extractHourMinute(displayId);
			if (!wall || !token) return false;
			const opDay = getOperationalDayFor(wall);
			return (isWeekendDay(opDay.weekday) || holidays.has(toIsoDate(opDay)) ? specialSlots : normalSlots).has(token);
		};
		return json({ logs: (await db.collection("OEES").aggregate([{ $match: {
			OEEDATE: {
				$gte: from,
				$lte: to
			},
			PRODUCED: { $gt: 0 }
		} }, { $group: {
			_id: {
				TYPE: "$TYPE",
				FAMILY: "$FAMILY",
				PARTNUMBER: "$PARTNUMBER",
				SERVER_PROCESS: "$SERVER_PROCESS",
				PROCESS: "$PROCESS",
				LEVEL: "$LEVEL",
				DISPLAY_ID: "$DISPLAY_ID"
			},
			PRODUCED: { $sum: "$PRODUCED" }
		} }]).toArray()).filter((row) => onSchedule(row._id.DISPLAY_ID)).map((row) => ({
			TYPE: row._id.TYPE || "UNKNOWN",
			FAMILY: row._id.FAMILY || "UNKNOWN",
			PARTNUMBER: row._id.PARTNUMBER || "UNKNOWN",
			SERVER_PROCESS: row._id.SERVER_PROCESS || "",
			PROCESS: row._id.PROCESS || "UNKNOWN",
			LEVEL: row._id.LEVEL || "UNKNOWN",
			DISPLAY_ID: row._id.DISPLAY_ID || "",
			PRODUCED: Number(row.PRODUCED) || 0
		})) });
	} catch (err) {
		console.error("Volume range query failed:", err);
		return json({ error: "Could not load the volume range" }, { status: 500 });
	}
}

export { GET };
//# sourceMappingURL=_server-o0lRBhMA.js.map
