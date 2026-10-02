import { b as private_env } from './shared-server-9-2j12mp.js';
import { c as connectDB } from './db-wxZFJtrv.js';
import { p as parseIsoDateUTC, i as isWeekendUTC, a as getShift, t as toErpDate, s as shiftDays, b as buildTimeline, c as plantNowAsUtc, d as getOperationalDateStr } from './plantTime-RlOFrl7D.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { p as processGlobalScrape, A as ACTIVE_SERVERS } from './cron-CPn-gAZw.js';
import { f as fail } from './index-CRFfcpCQ.js';
import 'mongodb';
import 'cheerio';
import 'cheerio-tableparser';
import 'node-cron';
import 'node:fs/promises';
import 'node:path';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/custom-scrape/+page.server.js
var ALL_PROCESSES = [
	"BOARD_LABEL",
	"SPI_S1",
	"SPI_S2",
	"UNDERFILLAOI",
	"AOI_PTH",
	"XRAY",
	"ICT",
	"PROGRAMMING",
	"MOL",
	"SINGULATION",
	"LGA_CONTAINMENT",
	"EDGEBONDAOI",
	"ROUTERMILLING",
	"ANTENNAATTACH",
	"LEAKTEST",
	"SPRAYCOAT",
	"SPRAYCOAT_L3",
	"CONT_LOADPCB",
	"SCREWDRIVE"
];
var load = async () => {
	return {
		processes: ALL_PROCESSES,
		defaultDate: getOperationalDateStr()
	};
};
var actions = { default: async ({ request }) => {
	const formData = await request.formData();
	const opDate = formData.get("opDate");
	const shiftId = formData.get("shiftId");
	const selectedProcess = formData.get("process");
	if (!opDate || !shiftId || !selectedProcess) return fail(400, { error: "Campos incompletos en el formulario." });
	const db = await connectDB();
	const targetDateUTC = parseIsoDateUTC(opDate);
	if (!targetDateUTC) return fail(400, { error: "Fecha operativa inválida (formato YYYY-MM-DD)." });
	let isSpecialDay = isWeekendUTC(targetDateUTC);
	if (!isSpecialDay) isSpecialDay = await isHoliday(db, opDate);
	const selectedShift = getShift(shiftId, isSpecialDay);
	if (!selectedShift) return fail(400, { error: "El turno seleccionado no es válido." });
	const opDay = {
		year: targetDateUTC.getUTCFullYear(),
		month: targetDateUTC.getUTCMonth() + 1,
		day: targetDateUTC.getUTCDate()
	};
	const fromDateStr = toErpDate(opDay);
	const toDateStr = selectedShift.crossesMidnight ? toErpDate(shiftDays(opDay, 1)) : fromDateStr;
	const scraperConfig = {
		fromDate: fromDateStr,
		fromTime: `${selectedShift.start}:00`,
		toDate: toDateStr,
		toTime: `${selectedShift.end}:00`,
		shiftName: isSpecialDay ? `${shiftId}_SPECIAL` : shiftId,
		isSpecialDay,
		timelineTemplate: buildTimeline(isSpecialDay)
	};
	const isForcedProd = (private_env.FORCE_PROD || process.env.FORCE_PROD) === "true";
	console.log(`[MANUAL] 🕒 EJECUTANDO SCRAPE UNIFICADO${isForcedProd ? " [PROD]" : " [DEV]"} | TURNO: ${scraperConfig.shiftName} | RANGO: [${scraperConfig.fromDate} ${scraperConfig.fromTime}] -> [${scraperConfig.toDate} ${scraperConfig.toTime}]`);
	const safeUtcDate = plantNowAsUtc();
	let scrapeSummary = [];
	try {
		const result = await processGlobalScrape(scraperConfig, selectedProcess);
		scrapeSummary = ACTIVE_SERVERS.map((srv) => {
			const serverData = result.perServerCounts[srv.name] || { total: 0 };
			const hasData = serverData.total > 0;
			return {
				timestamp: safeUtcDate,
				server: srv.name.toUpperCase(),
				shift: `${shiftId}_MANUAL`,
				status: hasData ? "SUCCESS" : "PENDING",
				message: hasData ? "" : "Ejecución manual finalizada sin cambios para este host.",
				records: Number(serverData.total) || 0,
				details: {
					upserted: hasData && result.count ? Math.round(serverData.total / result.count * result.upserted) : 0,
					modified: hasData && result.count ? Math.round(serverData.total / result.count * result.modified) : 0
				}
			};
		});
		await db.collection("SCRAPE_LOGS").insertMany(scrapeSummary);
		console.log(`✅ HISTORIAL REGISTRADO EN SCRAPE_LOGS.`);
		return {
			success: true,
			summary: scrapeSummary.map((log) => ({
				server: log.server,
				shift: log.shift,
				status: log.status,
				message: log.message,
				records: log.records,
				timestamp: log.timestamp.toISOString(),
				details: { ...log.details }
			})),
			details: {
				upserted: result.upserted,
				modified: result.modified
			}
		};
	} catch (err) {
		console.error(`🚨 Fallo crítico en proceso manual:`, err.message);
		scrapeSummary = ACTIVE_SERVERS.map((srv) => ({
			timestamp: safeUtcDate,
			server: srv.name.toUpperCase(),
			shift: `${shiftId}_MANUAL`,
			status: "ERROR",
			message: err.message,
			records: 0,
			details: {
				upserted: 0,
				modified: 0
			}
		}));
		await db.collection("SCRAPE_LOGS").insertMany(scrapeSummary);
		const serializableErrorSummary = scrapeSummary.map((log) => ({
			server: log.server,
			shift: log.shift,
			status: log.status,
			message: log.message,
			records: log.records,
			timestamp: log.timestamp.toISOString()
		}));
		return fail(500, {
			error: "Fallo crítico durante el raspado de datos.",
			message: err.message,
			summary: serializableErrorSummary
		});
	}
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CzUZwZGv.js')).default;
const server_id = "src/routes/admin/custom-scrape/+page.server.js";
const imports = ["_app/immutable/nodes/5.BQbPYJ_3.js","_app/immutable/chunks/jw0eR291.js","_app/immutable/chunks/eA5QwMQ2.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CZ2DiBTJ.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=5-D6mIp1Y6.js.map
