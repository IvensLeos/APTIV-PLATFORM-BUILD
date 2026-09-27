import { c as connectDB } from './db-W1d6-Une.js';
import { b as broadcastManager } from './broadcast-Bg8zhrwn.js';
import { d as getOperationalDateStr } from './plantTime-RlOFrl7D.js';
import { j as json } from './index-CRFfcpCQ.js';
import './private-C3tFArXN.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/notifier/andon-toggle/+server.js
async function POST({ request }) {
	try {
		const body = await request.json();
		if (!body.action || !["ACTIVATE", "DEACTIVATE"].includes(body.action)) return json({
			success: false,
			error: "Acción no válida o no especificada"
		}, { status: 400 });
		if (!body.machine || typeof body.machine !== "string") return json({
			success: false,
			error: "machine es obligatorio"
		}, { status: 400 });
		const db = await connectDB();
		const currentDateStr = getOperationalDateStr();
		if (body.action === "DEACTIVATE") {
			const lastLog = await db.collection("SCALATION_HISTORY").find({
				machine: body.machine,
				oeeDateStr: currentDateStr
			}).sort({ timestamp: -1 }).limit(1).toArray();
			if (lastLog.length > 0 && lastLog[0].action === "DEACTIVATE") return json({
				success: true,
				status: "ALREADY_CLEARED"
			});
			const finalStation = body.station || (lastLog.length > 0 ? lastLog[0].station : "");
			const deactivationPayload = {
				machine: body.machine,
				station: finalStation,
				process: body.process || (lastLog.length > 0 ? lastLog[0].process : "UNKNOWN"),
				oeeDateStr: currentDateStr,
				action: "DEACTIVATE",
				timestamp: /* @__PURE__ */ new Date()
			};
			await db.collection("SCALATION_HISTORY").insertOne(deactivationPayload);
			broadcastManager.emit(deactivationPayload);
			return json({
				success: true,
				status: "CLEARED"
			});
		}
		const escalationLevel = (await db.collection("ANDON_COUNTERS").findOneAndUpdate({ _id: `${body.machine}_${body.station || "MAIN"}_${currentDateStr}` }, { $inc: { seq: 1 } }, {
			upsert: true,
			returnDocument: "after"
		})).seq;
		const newEscalation = {
			machine: body.machine,
			process: body.process,
			station: body.station || "",
			partNumber: body.partNumber || "-",
			family: body.family || "UNKNOWN",
			failureCode: body.failureCode,
			attending: body.attending || "EN ESPERA DE SOPORTE TECNICO",
			timeLost: body.timeLost || 0,
			level: 1,
			oeeDateStr: currentDateStr,
			action: "ACTIVATE",
			timestamp: /* @__PURE__ */ new Date()
		};
		await db.collection("SCALATION_HISTORY").insertOne(newEscalation);
		broadcastManager.emit(newEscalation);
		return json({
			success: true,
			level: escalationLevel,
			status: "ACTIVATED"
		});
	} catch (err) {
		console.error("❌ Error en el switch del Semáforo Andon:", err);
		return json({
			success: false,
			error: err.message
		}, { status: 500 });
	}
}

export { POST };
//# sourceMappingURL=_server-40wC7eE_.js.map
