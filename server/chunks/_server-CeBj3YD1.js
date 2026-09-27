import { c as connectDB } from './db-W1d6-Une.js';
import { e as getOperationalDayFor, c as plantNowAsUtc } from './plantTime-D8u-b8Pp.js';
import { j as json } from './index-CRFfcpCQ.js';
import './private-C3tFArXN.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/oee/update/+server.js
var PATCH = async ({ request }) => {
	try {
		const { identifier, timeLostComment, comments, displayId, machine, process, station, level, type, serverSource, partNumber, family, rate, duration, timeLost, produced, serverProcess } = await request.json();
		if (!identifier || typeof identifier !== "string") return json({
			success: false,
			error: "Identifier is required as an immutable key"
		}, { status: 400 });
		if (typeof displayId !== "string" || !/^\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}(?::\d{2})?(?:AM|PM)/i.test(displayId)) return json({
			success: false,
			error: "displayId is required with format M/D/YYYY HH:MM:SSAM|PM"
		}, { status: 400 });
		if (!machine || typeof machine !== "string") return json({
			success: false,
			error: "machine is required"
		}, { status: 400 });
		const db = await connectDB();
		const [datePart, timePart] = displayId.split(" ");
		const [m, d, y] = datePart.split("/");
		const fullYear = y.length === 2 ? `20${y}` : y;
		const isoDateString = `${fullYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${timePart.replace(/AM|PM/i, "")}.000Z`;
		const realDatetime = new Date(isoDateString);
		if (timePart.includes("PM") && realDatetime.getUTCHours() < 12) realDatetime.setUTCHours(realDatetime.getUTCHours() + 12);
		else if (timePart.includes("AM") && realDatetime.getUTCHours() === 12) realDatetime.setUTCHours(0);
		const { year: opYear, month: opMonth, day: opDay } = getOperationalDayFor({
			year: parseInt(fullYear, 10),
			month: parseInt(m, 10),
			day: parseInt(d, 10),
			hour: realDatetime.getUTCHours(),
			minute: realDatetime.getUTCMinutes()
		});
		const calculatedOeeDateUTC = new Date(Date.UTC(opYear, opMonth - 1, opDay));
		const localTimestamp = plantNowAsUtc();
		const processedTimeLostComment = Array.isArray(timeLostComment) ? timeLostComment.map((f) => ({
			...f,
			code: f.code?.toUpperCase() || ""
		})) : timeLostComment?.toUpperCase() || "";
		const result = await db.collection("OEES").updateOne({ IDENTIFIER: identifier }, { $set: {
			DATETIME: realDatetime,
			MACHINE: machine?.toUpperCase(),
			PROCESS: process?.toUpperCase(),
			STATION: station,
			LEVEL: level,
			TYPE: type,
			SERVER_SOURCE: serverSource || "MANUAL_ENTRY",
			SERVER_PROCESS: serverProcess || process?.toUpperCase(),
			DISPLAY_ID: displayId,
			PARTNUMBER: partNumber,
			FAMILY: family,
			RATE: Number(rate) || 0,
			DURATION: Number(duration) || 0,
			PRODUCED: Number(produced) || 0,
			TIME_LOST: Number(timeLost) || 0,
			TIME_LOST_COMMENT: processedTimeLostComment,
			COMMENTS: comments?.toUpperCase() || "",
			OEEDATE: calculatedOeeDateUTC,
			UPDATED_AT: localTimestamp
		} }, { upsert: true });
		return json({
			success: true,
			upserted: result.upsertedCount > 0,
			modified: result.modifiedCount > 0
		});
	} catch (error) {
		console.error("❌ API Update Error:", error);
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
};

export { PATCH };
//# sourceMappingURL=_server-CeBj3YD1.js.map
