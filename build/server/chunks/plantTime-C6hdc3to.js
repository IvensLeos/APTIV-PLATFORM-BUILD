import { O as OP_DAY_CUTOFF_MINUTES, i as isWeekendDay, P as PLANT_TZ, g as getShift, t as toMinutes } from './shifts-BYGd7DZC.js';

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

export { plantNowAsUtc as a, getOperationalDateStr as b, getPlantParts as c, getOperationalDayFor as d, toIsoDate as e, getShiftWindow as f, getOperationalDateUTC as g, isWeekendUTC as i, parseIsoDateUTC as p, shiftDays as s, toErpDate as t };
//# sourceMappingURL=plantTime-C6hdc3to.js.map
