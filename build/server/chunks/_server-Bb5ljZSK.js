import { c as connectDB } from './db-CJixkQQl.js';
import { b as broadcastManager } from './broadcast-Bef7xGyo.js';
import { d as getOperationalDateStr } from './plantTime-CjpO2xUR.js';
import { j as json } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

var REJECTED = "El mensaje no se puede anunciar en las bocinas.";
var INVISIBLE = /[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\uFFF9-\uFFFB]/g;
var HOMOGLYPHS = {
	"А": "A",
	"В": "B",
	"Е": "E",
	"К": "K",
	"М": "M",
	"Н": "H",
	"О": "O",
	"Р": "P",
	"С": "C",
	"Т": "T",
	"Х": "X",
	"а": "A",
	"е": "E",
	"о": "O",
	"р": "P",
	"с": "C",
	"у": "Y",
	"і": "I",
	"Α": "A",
	"Β": "B",
	"Ε": "E",
	"Η": "H",
	"Ι": "I",
	"Κ": "K",
	"Μ": "M",
	"Ν": "N",
	"Ο": "O",
	"Ρ": "P",
	"Τ": "T",
	"Χ": "X",
	"ο": "O"
};
/** Exact tokens after folding, leet decode, and rejoining spaced letters. */
var BANNED = new Set([
	"PUTO",
	"PUTA",
	"PUTOS",
	"PUTAS",
	"MIERDA",
	"CABRON",
	"CABRONA",
	"CABRONES",
	"PENDEJO",
	"PENDEJA",
	"PENDEJOS",
	"VERGA",
	"VERGAS",
	"CHINGAR",
	"CHINGA",
	"CHINGADA",
	"CHINGADO",
	"CHINGADOS",
	"PINCHE",
	"PINCHES",
	"JODER",
	"JODIDO",
	"JODIDA",
	"MARICON",
	"MARICA",
	"MARICONA",
	"CULERO",
	"CULERA",
	"CULO",
	"CULOS",
	"MAMON",
	"MAMONA",
	"MAMADA",
	"HIJUEPUTA",
	"HIJODEPUTA",
	"CHINGATUMADRE",
	"VETEALAVERGA",
	"FUCK",
	"FUCKING",
	"FUCKED",
	"FUK",
	"SHIT",
	"BITCH",
	"ASSHOLE",
	"CUNT",
	"DICK",
	"PUSSY",
	"NIGGER",
	"NIGGA",
	"FAGGOT",
	"FAG",
	"SLUT",
	"WHORE",
	"COCK",
	"BASTARD"
]);
function fold(value) {
	let text = String(value || "").replace(INVISIBLE, "");
	text = text.replace(/[\u0000-\u001F\u007F]/g, "");
	for (const [from, to] of Object.entries(HOMOGLYPHS)) text = text.replaceAll(from, to);
	text = text.normalize("NFKD").replace(/\p{M}/gu, "");
	text = text.replace(/Ñ/g, "N").replace(/ñ/g, "n");
	return text.toUpperCase().replace(/\s+/g, " ").trim();
}
function leet(token) {
	if (!/[0-9@$]/.test(token)) return token;
	return token.replace(/0/g, "O").replace(/1/g, "I").replace(/3/g, "E").replace(/4/g, "A").replace(/5/g, "S").replace(/7/g, "T").replace(/@/g, "A").replace(/\$/g, "S");
}
function tokensOf(text) {
	const parts = text.split(/[^A-Z0-9]+/).filter(Boolean);
	const tokens = [];
	let letters = "";
	const flush = () => {
		if (letters.length >= 3) tokens.push(letters);
		letters = "";
	};
	for (const part of parts) {
		tokens.push(part);
		const decoded = leet(part);
		if (decoded !== part) tokens.push(decoded);
		if (/^[A-Z]$/.test(decoded)) letters += decoded;
		else flush();
	}
	flush();
	const joined = parts.map((part) => leet(part)).join("");
	if (joined) tokens.push(joined);
	return tokens;
}
function isOffensive(text) {
	if (text === "MENSAJE PERSONALIZADO") return true;
	return tokensOf(text).some((token) => BANNED.has(token));
}
/**
* Cleans a line that will be stored and spoken.
* Empty is allowed only when the field is optional.
* @param {unknown} value
* @param {{ required?: boolean }} [options]
* @returns {{ ok: true, text: string } | { ok: false, text: string, error: string }}
*/
function acceptAndonSpeech(value, options = {}) {
	const original = String(value ?? "");
	if (!original.trim()) return options.required ? {
		ok: false,
		text: "",
		error: REJECTED
	} : {
		ok: true,
		text: ""
	};
	const text = fold(original);
	if (!(text.length > 0 && text.length <= 120 && /^[A-Z0-9 .,\-/#()&]+$/.test(text) && !/(.)\1{7,}/.test(text) && !isOffensive(text))) return {
		ok: false,
		text: "",
		error: REJECTED
	};
	return {
		ok: true,
		text
	};
}

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
		const failure = acceptAndonSpeech(body.failureCode || "", { required: true });
		const attending = acceptAndonSpeech(body.attending || "EN ESPERA DE SOPORTE TECNICO", { required: true });
		if (!failure.ok || !attending.ok) return json({
			success: false,
			error: failure.error || attending.error
		}, { status: 400 });
		await broadcastManager.ready();
		const draft = {
			machine: body.machine,
			station: body.station || "",
			process: body.process,
			failureCode: body.failureCode || "",
			level: 1,
			action: "ACTIVATE"
		};
		const hold = broadcastManager.holdActivation(draft);
		if (!hold.held) return json({
			success: true,
			status: "ALREADY_ACTIVE",
			level: hold.open?.level || 1,
			failureCode: hold.open?.failureCode || ""
		});
		try {
			await db.collection("ANDON_COUNTERS").findOneAndUpdate({ _id: `${body.machine}_${body.station || "MAIN"}_${currentDateStr}` }, { $inc: { seq: 1 } }, { upsert: true });
			const newEscalation = {
				machine: body.machine,
				process: body.process,
				station: body.station || "",
				partNumber: body.partNumber || "-",
				family: body.family || "UNKNOWN",
				failureCode: failure.text,
				attending: attending.text,
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
				level: 1,
				status: "ACTIVATED"
			});
		} catch (err) {
			broadcastManager.releaseHold(draft);
			throw err;
		}
	} catch (err) {
		console.error("❌ Error en el switch del Semáforo Andon:", err);
		return json({
			success: false,
			error: err.message
		}, { status: 500 });
	}
}

export { POST };
//# sourceMappingURL=_server-Bb5ljZSK.js.map
