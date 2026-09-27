import { h as getPlantParts } from './plantTime-RlOFrl7D.js';

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
/** Token de hora en punto ("07:00 AM") para marcar el intervalo en vivo. */
function displayHourToken(displayId) {
	const rowMatch = displayId?.match(/(\d{1,2}):(\d{2}):?(\d{2})?\s*(AM|PM)/i);
	return rowMatch ? `${rowMatch[1].padStart(2, "0")}:00 ${rowMatch[4].toUpperCase()}` : "";
}
/** Hora en punto actual en el reloj de la planta. */
function liveHourToken(now = /* @__PURE__ */ new Date()) {
	const { hour } = getPlantParts(now);
	const convertedHour = hour % 12 === 0 ? 12 : hour % 12;
	const period = hour >= 12 ? "PM" : "AM";
	return `${String(convertedHour).padStart(2, "0")}:00 ${period}`;
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

export { formatToDBSlashDate as a, displayHourToken as d, extractHourMinute as e, formatQty as f, getRefinedDate as g, isIntervalInFuture as i, liveHourToken as l };
//# sourceMappingURL=captureFormat-FFTiojiT.js.map
