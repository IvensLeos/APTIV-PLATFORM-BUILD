import { b as buildTimeline } from './shifts-BYGd7DZC.js';
import { c as getPlantParts } from './plantTime-C6hdc3to.js';

//#region src/lib/captureFormat.js
/** Fecha y hora legibles a partir de un DISPLAY_ID ("M/D/YYYY h:mm:ssAM UTC"). */
function getRefinedDate(id) {
	if (!id) return {
		day: "",
		month: "",
		num: "",
		time: "--:--",
		period: ""
	};
	const dateMatch = id.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
	const realTimeMatch = id.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
	if (!dateMatch || !realTimeMatch) return {
		day: "",
		month: "",
		num: "",
		time: id,
		period: ""
	};
	const [, m, d, y] = dateMatch;
	const dateObj = new Date(y, m - 1, d);
	return {
		day: dateObj.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
		month: dateObj.toLocaleString("en-US", { month: "long" }).toUpperCase(),
		num: d,
		time: `${realTimeMatch[1]}:${realTimeMatch[2]}`,
		period: realTimeMatch[3].toUpperCase()
	};
}
/** Entero con separador de millares (en-US). */
function formatQty(value) {
	return Math.round(Number(value) || 0).toLocaleString("en-US");
}
/** "YYYY-MM-DD" -> "M/D/YYYY" (formato de DISPLAY_ID). */
function formatToDBSlashDate(isoDateString) {
	if (!isoDateString) return "";
	const [year, month, day] = isoDateString.split("-");
	return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
}
/** "06:40 AM" a partir del DISPLAY_ID, o cadena vacía. */
function extractHourMinute(displayId) {
	if (!displayId) return "";
	const fb = displayId.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
	if (!fb) return "";
	return `${parseInt(fb[1], 10).toString().padStart(2, "0")}:${fb[2]} ${fb[3].toUpperCase()}`;
}
/** Inicio del bloque ("06:40 AM", "06:00 AM") para marcar el intervalo en vivo. */
function displayHourToken(displayId) {
	return extractHourMinute(displayId);
}
/** "06:40 AM" → minutos desde medianoche. */
function tokenToMinutes(token) {
	const match = String(token || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
	if (!match) return null;
	let hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10);
	const ampm = match[3].toUpperCase();
	if (ampm === "PM" && hours < 12) hours += 12;
	if (ampm === "AM" && hours === 12) hours = 0;
	return hours * 60 + minutes;
}
/**
* Inicio del bloque que está corriendo ahora.
* No se recorta a la hora en punto: 06:00 y 06:40 son bloques distintos,
* igual que 16:00 y 16:10, o 22:00 y 22:16.
*/
function liveHourToken(now = /* @__PURE__ */ new Date(), isSpecialDay = false) {
	const { totalMinutes } = getPlantParts(now);
	const slot = buildTimeline(!!isSpecialDay).find((block) => {
		const start = tokenToMinutes(block.time);
		return start != null && totalMinutes >= start && totalMinutes < start + block.duration;
	});
	return slot ? slot.time : "";
}
/**
* El bloque todavía no empieza en hora de planta.
* Los bloques de madrugada (antes de las 06:40) pertenecen al día calendario siguiente.
*/
function isIntervalInFuture(slotDateStr, slotTimeStr, now = /* @__PURE__ */ new Date()) {
	if (!slotDateStr || !slotTimeStr) return false;
	const [m, d, y] = slotDateStr.split("/").map(Number);
	const match = slotTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
	if (!match || !y) return false;
	let hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10);
	const ampm = match[3].toUpperCase();
	if (ampm === "PM" && hours < 12) hours += 12;
	if (ampm === "AM" && hours === 12) hours = 0;
	let year = y;
	let month = m;
	let day = d;
	if (hours < 6 || hours === 6 && minutes < 40) {
		const next = new Date(Date.UTC(y, m - 1, d + 1));
		year = next.getUTCFullYear();
		month = next.getUTCMonth() + 1;
		day = next.getUTCDate();
	}
	const plant = getPlantParts(now);
	return year * 1e8 + month * 1e6 + day * 1e4 + hours * 100 + minutes > plant.year * 1e8 + plant.month * 1e6 + plant.day * 1e4 + plant.hour * 100 + plant.minute;
}
/** One choosable cause per captured split on an upstream interval. */
function upstreamCausesFromLog(doc) {
	if (!doc?.IDENTIFIER) return [];
	const base = {
		identifier: doc.IDENTIFIER,
		machine: doc.MACHINE || "",
		process: doc.PROCESS || "",
		family: doc.FAMILY || "",
		type: doc.TYPE || "",
		displayId: doc.DISPLAY_ID || ""
	};
	const comment = doc.TIME_LOST_COMMENT;
	const causes = [];
	if (Array.isArray(comment)) {
		comment.forEach((entry, index) => {
			const code = String(entry?.code || "").trim();
			const minutes = Number(entry?.minutes) || 0;
			if (!code || minutes <= 0) return;
			causes.push({
				...base,
				code,
				minutes,
				key: `${doc.IDENTIFIER}::${entry.id || index}`
			});
		});
		return causes;
	}
	const code = String(comment || "").trim();
	const minutes = Number(doc.TIME_LOST) || 0;
	if (!code || minutes <= 0) return causes;
	causes.push({
		...base,
		code,
		minutes,
		key: `${doc.IDENTIFIER}::0`
	});
	return causes;
}
/** " · FROM ROUTER 2 · FA-0001" when the split points at an upstream failure. */
function failureCauseSuffix(entry) {
	const machine = String(entry?.link?.machine || "").trim();
	const code = String(entry?.link?.code || "").trim();
	if (!machine && !code) return "";
	return ` · FROM ${[machine, code].filter(Boolean).join(" · ")}`;
}

export { formatQty as a, formatToDBSlashDate as b, displayHourToken as d, extractHourMinute as e, failureCauseSuffix as f, getRefinedDate as g, isIntervalInFuture as i, liveHourToken as l, upstreamCausesFromLog as u };
//# sourceMappingURL=captureFormat-016BC2OE.js.map
