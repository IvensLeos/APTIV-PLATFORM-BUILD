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
SHIFT_SCHEDULES.NORMAL.map((s) => s.id);
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
//#endregion
//#region src/lib/plantTime.js
/**
* @fileoverview Utilidades de fecha/hora ancladas a la zona horaria de la planta (PLANT_TZ),
* independientes de la zona horaria del servidor o del navegador.
* Módulo puro (Intl) usable en servidor y cliente.
*/
var WEEKDAYS = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
var pad2 = (n) => String(n).padStart(2, "0");
var plantFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: PLANT_TZ,
	hourCycle: "h23",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	weekday: "short"
});
/**
* @typedef {Object} PlantParts
* @property {number} year
* @property {number} month   1-12
* @property {number} day     1-31
* @property {number} hour    0-23
* @property {number} minute  0-59
* @property {number} second  0-59
* @property {number} weekday 0 = domingo ... 6 = sábado
* @property {number} totalMinutes  hour * 60 + minute
*/
/**
* Descompone un instante en el reloj de pared de la planta.
* @param {Date} [date]
* @returns {PlantParts}
*/
function getPlantParts(date = /* @__PURE__ */ new Date()) {
	const raw = Object.fromEntries(plantFormatter.formatToParts(date).map((p) => [p.type, p.value]));
	const hour = Number(raw.hour) % 24;
	const minute = Number(raw.minute);
	return {
		year: Number(raw.year),
		month: Number(raw.month),
		day: Number(raw.day),
		hour,
		minute,
		second: Number(raw.second),
		weekday: WEEKDAYS.indexOf(raw.weekday),
		totalMinutes: hour * 60 + minute
	};
}
/**
* Desplaza una fecha calendario N días (aritmética en UTC para evitar saltos por DST).
* @param {{year:number, month:number, day:number}} ymd
* @param {number} deltaDays
* @returns {{year:number, month:number, day:number, weekday:number}}
*/
function shiftDays({ year, month, day }, deltaDays) {
	const d = new Date(Date.UTC(year, month - 1, day + deltaDays));
	return {
		year: d.getUTCFullYear(),
		month: d.getUTCMonth() + 1,
		day: d.getUTCDate(),
		weekday: d.getUTCDay()
	};
}
/** "YYYY-MM-DD" */
var toIsoDate = ({ year, month, day }) => `${year}-${pad2(month)}-${pad2(day)}`;
/** "MM/DD/YY" (formato que espera el ERP MANTIS en from/to). */
var toErpDate = ({ year, month, day }) => `${pad2(month)}/${pad2(day)}/${String(year).slice(-2)}`;
/**
* Día operativo al que pertenece una hora de reloj de pared (corte 06:40).
* @param {{year:number, month:number, day:number, hour:number, minute:number}} wallClock
* @returns {{year:number, month:number, day:number, weekday:number}}
*/
function getOperationalDayFor(wallClock) {
	return shiftDays(wallClock, wallClock.hour * 60 + wallClock.minute < OP_DAY_CUTOFF_MINUTES ? -1 : 0);
}
/**
* Día operativo actual (o del instante indicado) en la planta.
* @param {Date} [date]
*/
var getOperationalDay = (date = /* @__PURE__ */ new Date()) => getOperationalDayFor(getPlantParts(date));
/** Día operativo actual como "YYYY-MM-DD". */
var getOperationalDateStr = (date = /* @__PURE__ */ new Date()) => toIsoDate(getOperationalDay(date));
/**
* Día operativo actual como Date a medianoche UTC (así se almacena OEEDATE en MongoDB).
* @param {Date} [date]
*/
function getOperationalDateUTC(date = /* @__PURE__ */ new Date()) {
	const { year, month, day } = getOperationalDay(date);
	return new Date(Date.UTC(year, month - 1, day));
}
/**
* Convierte "YYYY-MM-DD" (parámetro ?date= de la URL) a Date a medianoche UTC.
* Devuelve null si el formato es inválido.
* @param {string | null | undefined} isoDate
*/
function parseIsoDateUTC(isoDate) {
	if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
	const [y, m, d] = isoDate.split("-").map(Number);
	const date = new Date(Date.UTC(y, m - 1, d));
	return Number.isNaN(date.getTime()) ? null : date;
}
/**
* ¿La fecha calendario (medianoche UTC) es fin de semana?
* @param {Date} dateUTC
*/
var isWeekendUTC = (dateUTC) => isWeekendDay(dateUTC.getUTCDay());
/**
* Ventana de fechas/horas (formato ERP) que cubre un turno, vista desde un instante de la planta.
* Para el turno que cruza medianoche (T08): si el instante ya pasó su inicio, la ventana va de hoy
* a mañana; si estamos en la madrugada (antes del corte), va de ayer a hoy.
*
* @param {PlantParts} plant - Instante de referencia en hora de planta
* @param {'T09'|'T25'|'T08'} shiftId
* @param {boolean} isSpecialDay
* @returns {{ fromDate: string, toDate: string, fromTime: string, toTime: string }}
*/
function getShiftWindow(plant, shiftId, isSpecialDay) {
	const shift = getShift(shiftId, isSpecialDay);
	if (!shift) throw new Error(`Turno desconocido: ${shiftId}`);
	let fromDate, toDate;
	if (shift.crossesMidnight) if (plant.totalMinutes >= toMinutes(shift.start)) {
		fromDate = toErpDate(plant);
		toDate = toErpDate(shiftDays(plant, 1));
	} else {
		fromDate = toErpDate(shiftDays(plant, -1));
		toDate = toErpDate(plant);
	}
	else fromDate = toDate = toErpDate(plant);
	return {
		fromDate,
		toDate,
		fromTime: `${shift.start}:00`,
		toTime: `${shift.end}:00`
	};
}
/**
* Instante actual expresado como Date cuyos campos UTC coinciden con el reloj de pared de la planta.
* Sustituye al patrón `new Date(now - now.getTimezoneOffset()*60000)` usado para UPDATED_AT y
* timestamps de auditoría que la interfaz muestra tal cual, sin conversión de zona.
* @param {Date} [date]
*/
function plantNowAsUtc(date = /* @__PURE__ */ new Date()) {
	const p = getPlantParts(date);
	return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, date.getMilliseconds()));
}

export { PLANT_TZ as P, SHIFT_SCHEDULES as S, getShift as a, buildTimeline as b, plantNowAsUtc as c, getOperationalDateStr as d, getOperationalDayFor as e, formatTime12 as f, getOperationalDateUTC as g, getPlantParts as h, isWeekendUTC as i, toMinutes as j, toIsoDate as k, getShiftAtMinutes as l, getShiftWindow as m, isWeekendDay as n, getShiftBoundariesMinutes as o, parseIsoDateUTC as p, shiftDays as s, toErpDate as t };
//# sourceMappingURL=plantTime-RlOFrl7D.js.map
