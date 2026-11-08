//#region src/lib/shifts.js
/**
* @fileoverview Única fuente de verdad para turnos, corte de día operativo y
* plantilla de bloques horarios. Módulo puro (sin dependencias de servidor):
* se puede importar tanto en +page.server.js / cron como en componentes Svelte.
*/
/** Zona horaria de la planta (Reynosa: Central con horario de verano de EE.UU.). */
var PLANT_TZ = "America/Matamoros";
/** Corte del día operativo: todo lo anterior a esta hora pertenece al día anterior. */
var OP_DAY_CUTOFF = "06:40";
/** Convierte "HH:MM" a minutos desde medianoche. */
var toMinutes = (hhmm) => {
	const [h, m] = hhmm.split(":").map(Number);
	return h * 60 + m;
};
var OP_DAY_CUTOFF_MINUTES = toMinutes(OP_DAY_CUTOFF);
/**
* Horarios de turno.
* - NORMAL:  lunes a viernes.
* - SPECIAL: sábados, domingos y días festivos (colección HOLIDAYS).
* El turno T08 cruza la medianoche.
*/
var SHIFT_SCHEDULES = {
	NORMAL: [
		{
			id: "T09",
			start: "06:40",
			end: "16:10",
			crossesMidnight: false
		},
		{
			id: "T25",
			start: "16:10",
			end: "22:16",
			crossesMidnight: false
		},
		{
			id: "T08",
			start: "22:16",
			end: "06:40",
			crossesMidnight: true
		}
	],
	SPECIAL: [
		{
			id: "T09",
			start: "06:40",
			end: "14:40",
			crossesMidnight: false
		},
		{
			id: "T25",
			start: "14:40",
			end: "22:40",
			crossesMidnight: false
		},
		{
			id: "T08",
			start: "22:40",
			end: "06:40",
			crossesMidnight: true
		}
	]
};
var SHIFT_IDS = SHIFT_SCHEDULES.NORMAL.map((s) => s.id);
/** @param {boolean} isSpecialDay */
var getScheduleType = (isSpecialDay) => isSpecialDay ? "SPECIAL" : "NORMAL";
/** @param {boolean} isSpecialDay */
var getShifts = (isSpecialDay) => SHIFT_SCHEDULES[getScheduleType(isSpecialDay)];
/**
* @param {string} shiftId - 'T09' | 'T25' | 'T08'
* @param {boolean} isSpecialDay
*/
var getShift = (shiftId, isSpecialDay) => getShifts(isSpecialDay).find((s) => s.id === shiftId) || null;
/**
* Turno al que pertenece un instante del día expresado en minutos (0-1439).
* @param {number} totalMinutes
* @param {boolean} isSpecialDay
* @returns {'T09'|'T25'|'T08'}
*/
function getShiftAtMinutes(totalMinutes, isSpecialDay) {
	for (const s of getShifts(isSpecialDay)) {
		const start = toMinutes(s.start);
		const end = toMinutes(s.end);
		if (s.crossesMidnight ? totalMinutes >= start || totalMinutes < end : totalMinutes >= start && totalMinutes < end) return s.id;
	}
	return "T08";
}
/**
* Límites en minutos para clasificar turnos dentro de agregaciones de MongoDB
* (T09 = [t09Start, t25Start), T25 = [t25Start, t08Start), resto = T08).
* @param {boolean} isSpecialDay
*/
function getShiftBoundariesMinutes(isSpecialDay) {
	const [t09, t25, t08] = getShifts(isSpecialDay);
	return {
		t09Start: toMinutes(t09.start),
		t25Start: toMinutes(t25.start),
		t08Start: toMinutes(t08.start)
	};
}
/** @param {number} dayOfWeek - 0 = domingo ... 6 = sábado */
var isWeekendDay = (dayOfWeek) => dayOfWeek === 0 || dayOfWeek === 6;
/**
* Formatea minutos del día como "hh:mm AM/PM" con hora a dos dígitos (ej. "06:40 AM", "12:00 PM").
* Es el formato de `time` en la plantilla de bloques y el token que usa el scraper para buscarla.
* @param {number} totalMinutes
*/
function formatTime12(totalMinutes) {
	const minutes = (totalMinutes % 1440 + 1440) % 1440;
	const hh = Math.floor(minutes / 60);
	const mm = minutes % 60;
	const period = hh >= 12 ? "PM" : "AM";
	const hh12 = hh % 12 || 12;
	return `${String(hh12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${period}`;
}
/**
* Minutos desde medianoche para un reloj de DISPLAY_ID ("6:40:00 AM" o "06:40 AM").
* @param {string} label
* @returns {number | null}
*/
function parseClockMinutes(label) {
	const match = String(label || "").match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
	if (!match) return null;
	let hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10) || 0;
	const ampm = match[3].toUpperCase();
	if (ampm === "PM" && hours !== 12) hours += 12;
	if (ampm === "AM" && hours === 12) hours = 0;
	if (hours > 23 || minutes > 59) return null;
	return hours * 60 + minutes;
}
/**
* Orden dentro del día operativo. Lo anterior a las 06:40 es el cierre de T08 y va al final.
* 16:00 y 16:10 no empatan: el minuto entra en la clave.
* @param {string} label
*/
function operationalSortKey(label) {
	const total = parseClockMinutes(label);
	if (total == null) return Number.MAX_SAFE_INTEGER;
	return total < OP_DAY_CUTOFF_MINUTES ? total + 1440 : total;
}
/**
* Plantilla de bloques horarios del día operativo completo (06:40 → 06:40 del día siguiente).
* Cada turno se parte en bloques que terminan en la siguiente hora en punto o en el fin del turno,
* de modo que las duraciones reflejan los minutos reales producibles por bloque.
*
* @param {boolean} isSpecialDay
* @returns {{ time: string, shift: string, duration: number }[]}
*/
function buildTimeline(isSpecialDay) {
	const timeline = [];
	for (const shift of getShifts(isSpecialDay)) {
		let cursor = toMinutes(shift.start);
		const end = toMinutes(shift.end) + (shift.crossesMidnight ? 1440 : 0);
		while (cursor < end) {
			const nextHour = (Math.floor(cursor / 60) + 1) * 60;
			const blockEnd = Math.min(nextHour, end);
			timeline.push({
				time: formatTime12(cursor),
				shift: shift.id,
				duration: blockEnd - cursor
			});
			cursor = blockEnd;
		}
	}
	return timeline;
}
/**
* Duración (minutos) del bloque que inicia exactamente en HH:MM, según la plantilla del día.
* Devuelve null si no hay bloque que arranque a esa hora.
* @param {boolean} isSpecialDay
* @param {number} totalMinutes
*/
function getBlockDuration(isSpecialDay, totalMinutes) {
	const token = formatTime12(totalMinutes);
	const slot = buildTimeline(isSpecialDay).find((t) => t.time === token);
	return slot ? slot.duration : null;
}

export { OP_DAY_CUTOFF_MINUTES as O, PLANT_TZ as P, SHIFT_SCHEDULES as S, getShiftAtMinutes as a, buildTimeline as b, getShiftBoundariesMinutes as c, SHIFT_IDS as d, getBlockDuration as e, formatTime12 as f, getShift as g, getShifts as h, isWeekendDay as i, operationalSortKey as o, parseClockMinutes as p, toMinutes as t };
//# sourceMappingURL=shifts-BYGd7DZC.js.map
