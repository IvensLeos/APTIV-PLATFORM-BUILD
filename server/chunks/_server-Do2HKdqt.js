import { c as connectDB } from './db-W1d6-Une.js';
import { b as broadcastManager } from './broadcast-Bg8zhrwn.js';
import { j as json } from './index-CRFfcpCQ.js';
import './private-C3tFArXN.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/notifier/andon-trigger/+server.js
async function POST({ request }) {
	try {
		const body = await request.json();
		const db = await connectDB();
		const now = /* @__PURE__ */ new Date();
		const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		const matchQuery = {
			machine: body.machine,
			station: body.station,
			oeeDateStr: currentDateStr
		};
		const escalationLevel = await db.collection("SCALATION_HISTORY").countDocuments(matchQuery) + 1;
		const newEscalation = {
			machine: body.machine,
			process: body.process,
			station: body.station,
			partNumber: body.partNumber,
			family: body.family,
			displayId: body.displayId,
			failureCode: body.failureCode,
			attending: body.attending,
			timeLost: body.timeLost || 15,
			level: escalationLevel,
			oeeDateStr: currentDateStr,
			timestamp: /* @__PURE__ */ new Date()
		};
		newEscalation._id = (await db.collection("SCALATION_HISTORY").insertOne(newEscalation)).insertedId;
		broadcastManager.emit(newEscalation);
		return json({
			success: true,
			level: escalationLevel
		});
	} catch (err) {
		console.error("❌ Error en el motor de conteo Andon:", err);
		return json({
			success: false,
			error: err.message
		}, { status: 500 });
	}
}

export { POST };
//# sourceMappingURL=_server-Do2HKdqt.js.map
