import { b as private_env } from './shared-server-9-2j12mp.js';
import { c as connectDB } from './db-wxZFJtrv.js';
import { c as plantNowAsUtc, e as getOperationalDayFor, f as formatTime12, h as getPlantParts, j as toMinutes, s as shiftDays, k as toIsoDate, l as getShiftAtMinutes, b as buildTimeline, m as getShiftWindow, n as isWeekendDay, P as PLANT_TZ, S as SHIFT_SCHEDULES } from './plantTime-RlOFrl7D.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import * as cheerio from 'cheerio';
import cheerioTableparser from 'cheerio-tableparser';
import cron from 'node-cron';
import 'node:fs/promises';
import 'node:path';

//#region src/lib/scraper.js
var parseMRPTable = (html) => {
	const cleanedHtml = html.replace(/&nbsp;/g, "").replace(/&nbsp/g, "");
	const $ = cheerio.load(cleanedHtml);
	cheerioTableparser($);
	const tableData = $("table").eq(1).parsetable(false, true, true);
	const registros = [];
	if (!tableData || tableData.length < 9) {
		console.error(`❌ [SCRAPER LOG] Error: La segunda tabla no tiene el mínimo de 9 columnas requeridas.`);
		return registros;
	}
	let lastProcess = "", lastTimeRange = "", lastStation = "", lastFamily = "", lastPart = "";
	const totalFilas = tableData[0].length;
	for (let i = 2; i < totalFilas; i++) {
		const currentProcess = tableData[0]?.[i]?.trim() || "";
		const currentTimeRange = tableData[1]?.[i]?.trim() || "";
		const currentStation = tableData[2]?.[i]?.trim() || "";
		const currentFamily = tableData[3]?.[i]?.trim() || "";
		const currentPart = tableData[4]?.[i]?.trim() || "";
		const currentPass = tableData[5]?.[i]?.trim() || "0";
		const currentFail = tableData[6]?.[i]?.trim() || "0";
		const currentTotal = tableData[7]?.[i]?.trim() || "0";
		const currentYield = tableData[8]?.[i]?.trim() || "0.00";
		if (!currentProcess && !currentTimeRange && !currentStation && !currentFamily && !currentPart) continue;
		lastProcess = currentProcess !== "" ? currentProcess : lastProcess;
		lastTimeRange = currentTimeRange !== "" ? currentTimeRange : lastTimeRange;
		lastStation = currentStation !== "" ? currentStation : lastStation;
		lastFamily = currentFamily !== "" ? currentFamily : lastFamily;
		lastPart = currentPart !== "" ? currentPart : lastPart;
		registros.push({
			process: lastProcess || null,
			timeRange: lastTimeRange,
			station: lastStation || null,
			productFamily: lastFamily || null,
			partNumber: lastPart || null,
			pass: parseInt(currentPass.replace(/,/g, ""), 10) || 0,
			fail: parseInt(currentFail.replace(/,/g, ""), 10) || 0,
			total: parseInt(currentTotal.replace(/,/g, ""), 10) || 0,
			yield: parseFloat(currentYield) || 0
		});
	}
	return registros;
};
//#endregion
//#region src/lib/server/cron.js
var SERVERS = [
	{
		name: "REMAN61A",
		devPath: "/reman61a_1.html",
		prodHost: "https://reman61a.aptiv.com",
		optionsKey: "-fpyield_fix"
	},
	{
		name: "REMAN65",
		devPath: "/reman65_1.html",
		prodHost: "https://reman65.aptiv.com",
		optionsKey: "-fpyield2"
	},
	{
		name: "REDBC001",
		devPath: "/redbc001_1.html",
		prodHost: "https://redbc001.aptiv.com",
		optionsKey: "-fpyield2"
	}
];
var DEFAULT_PROCESSES = [
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
var PROCESS_ALIASES = {
	"BOARD_LABEL": ["LASER ETCH", "BOARD_LABEL"],
	"SPI_S1": ["SMT", "SPI_S1"],
	"SPI_S2": ["SMT", "SPI_S2"],
	"UNDERFILLAOI": ["UNDERFILL", "UNDERFILLAOI"],
	"AOI_PTH": ["PTH", "AOI_PTH"],
	"XRAY": ["XRAY"],
	"ICT": ["ICT"],
	"PROGRAMMING": ["PROGRAMMING"],
	"MOL": ["PROGRAMMING", "MOL"],
	"SINGULATION": ["SINGULATION"],
	"LGA_CONTAINMENT": ["LGA CONTAINMENT", "LGA_CONTAINMENT"],
	"EDGEBONDAOI": ["EDGEBOND", "EDGEBONDAOI"],
	"ROUTERMILLING": ["ROUTERMILLING"],
	"ANTENNAATTACH": ["ANTENNA ATTACH", "ANTENNAATTACH"],
	"LEAKTEST": ["LEAKTEST"],
	"SPRAYCOAT": ["CONFORMAL", "SPRAYCOAT"],
	"SPRAYCOAT_L3": ["CONFORMAL", "SPRAYCOAT_L3"],
	"CONT_LOADPCB": ["SCREWDRIVE", "CONT_LOADPCB"],
	"SCREWDRIVE": ["SCREWDRIVE"]
};
var ACTIVE_SERVERS = SERVERS;
/**
* Motivos por los que el planificador dispara un scrape. Se pasan explícitamente a
* runScraper/getShiftConfig en lugar de deducirlos del minuto exacto de ejecución.
* - INTERVAL: monitoreo continuo; el turno se deduce de la hora actual.
* - CIERRE:   cierre de turno; el turno viene fijado por el trigger y `schedule`
*             indica a qué tipo de día aplica ('NORMAL' | 'SPECIAL' | 'ANY').
*/
var TRIGGERS = Object.freeze({
	INTERVAL: { type: "INTERVAL" },
	CIERRE_T09_NORMAL: {
		type: "CIERRE",
		shift: "T09",
		schedule: "NORMAL"
	},
	CIERRE_T25_NORMAL: {
		type: "CIERRE",
		shift: "T25",
		schedule: "NORMAL"
	},
	CIERRE_T09_SPECIAL: {
		type: "CIERRE",
		shift: "T09",
		schedule: "SPECIAL"
	},
	CIERRE_T25_SPECIAL: {
		type: "CIERRE",
		shift: "T25",
		schedule: "SPECIAL"
	},
	CIERRE_T08: {
		type: "CIERRE",
		shift: "T08",
		schedule: "ANY"
	}
});
var scrapeChain = Promise.resolve();
var activeScrapes = 0;
var isScrapeRunning = () => activeScrapes > 0;
/**
* Procesa la extracción unificada de todos los servidores en un único pool Cross-Server
* para evitar duplicidades de tiempo cuando una estación reporta a múltiples hosts.
* Serializada: si hay otra ejecución en curso, espera a que termine.
*/
function processGlobalScrape(config = null, processFilter = "ALL") {
	const run = scrapeChain.then(async () => {
		activeScrapes++;
		try {
			return await executeGlobalScrape(config, processFilter);
		} finally {
			activeScrapes--;
		}
	});
	scrapeChain = run.catch(() => {});
	return run;
}
async function executeGlobalScrape(config, processFilter) {
	const db = await connectDB();
	const scraperConfig = config || await getShiftConfig(db);
	private_env.FORCE_PROD || process.env.FORCE_PROD;
	const htmlContents = await Promise.all(SERVERS.map(async (server) => {
		try {
			{
				let processParam = processFilter === "ALL" ? DEFAULT_PROCESSES.map((p) => p.replace(/\s+/g, "")).join(",") : processFilter.replace(/\s+/g, "");
				const reportUrl = `${server.prodHost}/std_public/wipreports?report=X_MANTIS&options=${server.optionsKey}+hourly+station+productfamily+partnumber+-disallow+station+DLNPROFINLTVIUF+ADOMO_SCAN_01+DLNTSTSMTICT16+DLNTSTFINVOLMOL+GUMP_QUALITY+SPRAYCOAT_GUMP+CALIDAD+WEB+DLNPROFINLKTMRR+DLNPROFINRTR08+DLNPROFINRTR_07+DLNTSTSMTICT17+DLNTSTSMTICT18+DLNTSTSMTICTIL1+DLNTSTSMTICTIL2+DLNTSTSMTICTIL3+DLNTSTSMTICTIL4+DLNTSTSMTICTIL5+DLNTSTSMTICTIL7+DLNTSTSMTICTIL9+DLNTSTSMTICTL10+DLNTSTSMTICTL12+DLNTSTSMTICTL13+DLNTSTSMTICTL15+ECU_ICT_01+INLINE_ICT_01+DLNPROFINRTR_06+GM_DMS_ICT01+GMDMSMOL01+DLNPROFINRTR_05+DLNTSTSMTICT14+DLNTSTSMTICTIL11+DLNTSTSMTICTVIUF&processSList=${processParam}&from=${scraperConfig.fromDate}%20${scraperConfig.fromTime}&to=${scraperConfig.toDate}%20${scraperConfig.toTime}&maxevents=5000000&mode=1`;
				const res = await fetch(reportUrl);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return {
					server,
					html: await res.text()
				};
			}
		} catch (err) {
			console.error(`🚨 Fallo de red en host [${server.name}]:`, err.message);
			return {
				server,
				html: null
			};
		}
	}));
	const [stationsList, itemsList, ratesList, conversionsList] = await Promise.all([
		db.collection("STATIONS").find({}).toArray(),
		db.collection("ITEMS").find({}).toArray(),
		db.collection("RATES").find({}).toArray(),
		db.collection("PART_CONVERSIONS").find({}).toArray()
	]);
	const stationsMap = Object.fromEntries(stationsList.map((s) => [s.STATION, s]));
	const itemsMap = Object.fromEntries(itemsList.map((i) => [i.PARTNUMBER, i]));
	const ratesMap = Object.fromEntries(ratesList.map((r) => [`${r.PARTNUMBER}_${r.MACHINE}`, r.RATE]));
	const convMap = Object.fromEntries(conversionsList.map((c) => [`${c.SERVER_PARTNUMBER}|${c.SERVER_PROCESS}`, c.REAL_PARTNUMBER]));
	const consolidatedMap = /* @__PURE__ */ new Map();
	htmlContents.forEach(({ server, html }) => {
		if (!html) return;
		const rawData = parseMRPTable(html);
		if (!rawData) return;
		rawData.forEach((item) => {
			if (!item.timeRange || !item.station) return;
			const serverProcess = item.process || "UNKNOWN";
			const realPN = convMap[`${item.partNumber}|${serverProcess}`] || item.partNumber;
			const machineTarget = ((stationsMap[item.station.trim()] || {}).MACHINE || item.station).trim();
			const fusionKey = `${item.timeRange.trim()}_${machineTarget}_${realPN.trim()}`;
			if (consolidatedMap.has(fusionKey)) {
				const existing = consolidatedMap.get(fusionKey);
				existing.total = (Number(existing.total) || 0) + (Number(item.total) || 0);
				existing.pass = (Number(existing.pass) || 0) + (Number(item.pass) || 0);
				existing.fail = (Number(existing.fail) || 0) + (Number(item.fail) || 0);
				existing.yield = existing.pass + existing.fail > 0 ? Number((existing.pass / (existing.pass + existing.fail) * 100).toFixed(2)) : 0;
				if (existing.stationsScraped && !existing.stationsScraped.includes(item.station)) existing.stationsScraped.push(item.station);
			} else consolidatedMap.set(fusionKey, {
				...item,
				partNumber: realPN.trim(),
				serverSource: server.name,
				machineTarget,
				stationsScraped: [item.station]
			});
		});
	});
	const groups = {};
	consolidatedMap.forEach((item) => {
		const groupKey = `${item.timeRange}_${item.machineTarget}`;
		if (!groups[groupKey]) groups[groupKey] = [];
		groups[groupKey].push(item);
	});
	const wipeManualFilters = [];
	const operations = [];
	const localServerTime = plantNowAsUtc();
	for (const key in groups) {
		const itemsInGroup = groups[key].sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
		if (itemsInGroup.length === 0) continue;
		const firstItem = itemsInGroup[0];
		const stationInfo = stationsMap[firstItem.station] || {};
		const dbProcessRaw = (stationInfo.PROCESS || "UNKNOWN").trim().toUpperCase();
		const filterTarget = processFilter.trim().toUpperCase();
		const allowedProcesses = PROCESS_ALIASES[filterTarget] || [filterTarget];
		const isMatch = dbProcessRaw === filterTarget || allowedProcesses.some((alias) => alias.replace(/\s+/g, "").toUpperCase() === dbProcessRaw.replace(/\s+/g, "").toUpperCase());
		if (processFilter !== "ALL" && !isMatch) continue;
		const match = firstItem.timeRange?.match(/^(\d{2})\/(\d{2})\/(\d{2,4})\s*(\d{2}):(\d{2}):(\d{2})/);
		if (!match) continue;
		const [, m_log, d_log, y_log, hh_str, mm_str, ss_str] = match;
		const hh = parseInt(hh_str, 10) || 0;
		const mm = parseInt(mm_str, 10) || 0;
		const yearFull = y_log.length === 2 ? `20${y_log}` : y_log;
		const isoMonth = m_log.padStart(2, "0");
		const isoDay = d_log.padStart(2, "0");
		const dateTimeFixed = /* @__PURE__ */ new Date(`${yearFull}-${isoMonth}-${isoDay}T${hh_str}:${mm_str}:${ss_str}.000Z`);
		const { year: opYear, month: opMonth, day: opDay } = getOperationalDayFor({
			year: parseInt(yearFull, 10),
			month: parseInt(m_log, 10),
			day: parseInt(d_log, 10),
			hour: hh,
			minute: mm
		});
		const oeeDateFixed = new Date(Date.UTC(opYear, opMonth - 1, opDay));
		const ampm = hh >= 12 ? "PM" : "AM";
		const hh12 = (hh % 12 || 12).toString().padStart(2, "0");
		const displayId = `${parseInt(m_log, 10)}/${parseInt(d_log, 10)}/${yearFull} ${hh12}:${mm_str}:${ss_str}${ampm} UTC`;
		const cleanTimeToken = formatTime12(hh * 60 + mm);
		const configSlot = Array.isArray(scraperConfig.timelineTemplate) ? scraperConfig.timelineTemplate.find((t) => t.time === cleanTimeToken) : null;
		if (!configSlot) continue;
		let remainingMinutes = Number(configSlot.duration) || 0;
		let hasAddedWipeFilterForMachine = false;
		itemsInGroup.forEach((item, index) => {
			const processName = stationInfo.PROCESS || "UNKNOWN";
			const serverProcess = item.process || "UNKNOWN";
			const realPN = item.partNumber;
			const iInfo = itemsMap[realPN] || {};
			const machine = item.machineTarget;
			const baseRate = Number(ratesMap[`${realPN}_${machine}`]) || 1;
			const prodCount = Number(item.total) || 0;
			let finalDuration = index === itemsInGroup.length - 1 ? Math.max(0, remainingMinutes) : Math.min(Math.floor(prodCount * 60 / baseRate) || 0, remainingMinutes);
			remainingMinutes -= finalDuration;
			const finalRate = Math.floor(baseRate / 60 * finalDuration) || 0;
			let timeLost = prodCount < finalRate ? Math.round(finalDuration - prodCount * 60 / baseRate) : 0;
			const cleanOpDate = `${opYear}${String(opMonth).padStart(2, "0")}${String(opDay).padStart(2, "0")}`;
			const cleanTime = `${hh_str}${mm_str}`;
			const machineKey = machine.replace(/\s+/g, "");
			const uniqueIdentifier = `${item.serverSource}_${machineKey}_${realPN}_${cleanOpDate}_${cleanTime}`.toUpperCase();
			if (!hasAddedWipeFilterForMachine && item.serverSource !== "MANUAL_ENTRY") {
				wipeManualFilters.push({
					SERVER_SOURCE: "MANUAL_ENTRY",
					DATETIME: dateTimeFixed,
					MACHINE: machine
				});
				hasAddedWipeFilterForMachine = true;
			}
			const transformed = {
				IDENTIFIER: uniqueIdentifier,
				DATETIME: dateTimeFixed,
				DISPLAY_ID: displayId,
				DURATION: Number(finalDuration) || 0,
				TIME_LOST: Math.max(0, timeLost) || 0,
				FAMILY: iInfo.FAMILY || "UNKNOWN",
				TYPE: iInfo.TYPE || "UNKNOWN",
				LEVEL: iInfo.LEVEL || "UNKNOWN",
				MACHINE: machine,
				OEEDATE: oeeDateFixed,
				PARTNUMBER: realPN,
				PROCESS: processName,
				SERVER_PROCESS: serverProcess,
				PRODUCED: prodCount,
				RATE: Number(finalRate) || 0,
				STATION: item.stationsScraped.join(", "),
				UPDATED_AT: localServerTime,
				SERVER_SOURCE: item.serverSource,
				QUALITY: {
					pass: Number(item.pass) || 0,
					fail: Number(item.fail) || 0,
					yield: Number(item.yield) || 0
				}
			};
			operations.push({ updateOne: {
				filter: { IDENTIFIER: uniqueIdentifier },
				update: { $set: transformed },
				upsert: true
			} });
		});
	}
	if (wipeManualFilters.length > 0) try {
		const wipeResult = await db.collection("OEES").deleteMany({ $or: wipeManualFilters });
		if (wipeResult.deletedCount > 0) console.log(`🔌 [SCRAPER] INFO: SE ELIMINARON ${wipeResult.deletedCount} REGISTROS FANTASMA "MANUAL_ENTRY".`);
	} catch (wipeErr) {
		console.error("❌ Error en el motor machacador de entradas manuales:", wipeErr);
	}
	if (operations.length === 0) return {
		success: true,
		count: 0,
		upserted: 0,
		modified: 0,
		perServerCounts: {}
	};
	const perServerCounts = {};
	operations.forEach((op) => {
		const src = op.updateOne.update.$set.SERVER_SOURCE;
		if (!perServerCounts[src]) perServerCounts[src] = {
			upserted: 0,
			modified: 0,
			total: 0
		};
		perServerCounts[src].total += 1;
	});
	try {
		const result = await db.collection("OEES").bulkWrite(operations, { ordered: false });
		return {
			success: true,
			count: operations.length,
			upserted: result.upsertedCount,
			modified: result.modifiedCount,
			perServerCounts
		};
	} catch (error) {
		const bulkResult = error.result || {};
		return {
			success: true,
			count: operations.length,
			upserted: bulkResult.nUpserted || 0,
			modified: bulkResult.nModified || 0,
			perServerCounts
		};
	}
}
/**
* Configuración de la ventana de scraping (rango from/to que se envía al ERP) para un turno.
*
* - Con trigger INTERVAL el turno se deduce de la hora actual de la planta.
* - Con trigger CIERRE el turno viene fijado por el planificador; así el cierre de las 16:11
*   sigue evaluando T09 aunque la ejecución se retrase unos segundos o minutos.
*
* @param {import('mongodb').Db | null} db
* @param {{type:string, shift?:string, schedule?:string}} [trigger]
* @param {Date} [now]
*/
async function getShiftConfig(db, trigger = TRIGGERS.INTERVAL, now = /* @__PURE__ */ new Date()) {
	const plant = getPlantParts(now);
	const opDay = getOperationalDayFor(plant);
	const isCierre = trigger.type === "CIERRE";
	const scheduleDay = isCierre && trigger.shift === "T08" && plant.totalMinutes >= toMinutes("06:40") ? shiftDays(opDay, -1) : opDay;
	let isSpecialDay = isWeekendDay(scheduleDay.weekday);
	if (!isSpecialDay && db) isSpecialDay = await isHoliday(db, toIsoDate(scheduleDay));
	const shiftId = isCierre ? trigger.shift : getShiftAtMinutes(plant.totalMinutes, isSpecialDay);
	return {
		...getShiftWindow(plant, shiftId, isSpecialDay),
		shiftName: isCierre ? `${shiftId}_CIERRE` : shiftId,
		isSpecialDay,
		timelineTemplate: buildTimeline(isSpecialDay)
	};
}
/**
* Orquestador Unificado de Raspado de Datos
* @param {{type:string, shift?:string, schedule?:string}} trigger - Motivo del disparo (ver TRIGGERS)
*/
async function runScraper(trigger = TRIGGERS.INTERVAL) {
	const triggerName = Object.keys(TRIGGERS).find((k) => TRIGGERS[k] === trigger) || trigger.type;
	if (isScrapeRunning()) {
		console.log(`[CRON SKIP] ⏳ ${triggerName}: scrape anterior aún en ejecución.`);
		return;
	}
	const db = await connectDB();
	const config = await getShiftConfig(db, trigger);
	if (trigger.type === "CIERRE" && trigger.schedule !== "ANY") {
		const expectsSpecialDay = trigger.schedule === "SPECIAL";
		if (config.isSpecialDay !== expectsSpecialDay) {
			if (expectsSpecialDay === false) console.log(`[CRON SKIP] 🛑 ${triggerName}: IGNORANDO VENTANA ORDINARIA POR DIA FESTIVO.`);
			return;
		}
	}
	const isForcedProd = (private_env.FORCE_PROD || process.env.FORCE_PROD) === "true";
	console.log(`[CRON] 🕒 EJECUTANDO SCRAPE UNIFICADO${isForcedProd ? " [PROD]" : " [DEV]"} | TRIGGER: ${triggerName} | TURNO: ${config.shiftName} | RANGO: [${config.fromDate} ${config.fromTime}] -> [${config.toDate} ${config.toTime}]`);
	const safeUtcDate = plantNowAsUtc();
	try {
		const result = await processGlobalScrape(config, "ALL");
		const logEntries = SERVERS.map((srv) => {
			const serverData = result.perServerCounts[srv.name] || { total: 0 };
			const isSuccess = serverData.total > 0;
			return {
				timestamp: safeUtcDate,
				server: srv.name.toUpperCase(),
				shift: config.shiftName,
				status: isSuccess ? "SUCCESS" : "PENDING",
				message: isSuccess ? "" : "Ejecución unificada finalizada sin cambios detectados para este host.",
				records: Number(serverData.total) || 0,
				details: {
					upserted: isSuccess ? Math.round(serverData.total / result.count * result.upserted) : 0,
					modified: isSuccess ? Math.round(serverData.total / result.count * result.modified) : 0
				}
			};
		});
		await db.collection("SCRAPE_LOGS").insertMany(logEntries);
		console.log(`✅ HISTORIAL REGISTRADO EN SCRAPE_LOGS.`);
	} catch (err) {
		const errorEntries = SERVERS.map((srv) => ({
			timestamp: safeUtcDate,
			server: srv.name.toUpperCase(),
			shift: config.shiftName,
			status: "ERROR",
			message: err.message,
			records: 0,
			details: {
				upserted: 0,
				modified: 0
			}
		}));
		await db.collection("SCRAPE_LOGS").insertMany(errorEntries);
		console.error(`🚨 Fallo crítico en el Orquestador: Registrados 3 logs de error en MongoDB.`, err.message);
	}
}
/**
* Expresión cron para el cierre de un turno: un minuto después de su hora de fin.
* @param {string} endHHMM - Hora de fin del turno ("16:10")
* @param {string} daysOfWeek - Campo día-de-semana de cron ("1-5" o "*")
*/
function closingCronExpr(endHHMM, daysOfWeek) {
	const minutes = toMinutes(endHHMM) + 1;
	return `${minutes % 60} ${Math.floor(minutes / 60)} * * ${daysOfWeek}`;
}
/**
* Inicializador Planificador de Tareas
*/
function initCron() {
	const instanceId = process.env.NODE_APP_INSTANCE || "0";
	if (instanceId !== "0") {
		console.log(`[CRON Espejo] Instancia ${instanceId}: Modo Pasivo Activado Para Evitar Colisiones En El ERP.`);
		return;
	}
	console.log(`🚀 [CRON Maestro] Instancia 0: Activando planificadores en zona horaria ${PLANT_TZ}...`);
	const opts = { timezone: PLANT_TZ };
	const [normalT09, normalT25, t08] = SHIFT_SCHEDULES.NORMAL;
	const [specialT09, specialT25] = SHIFT_SCHEDULES.SPECIAL;
	cron.schedule("*/15 * * * *", () => runScraper(TRIGGERS.INTERVAL), opts);
	cron.schedule(closingCronExpr(normalT09.end, "1-5"), () => runScraper(TRIGGERS.CIERRE_T09_NORMAL), opts);
	cron.schedule(closingCronExpr(normalT25.end, "1-5"), () => runScraper(TRIGGERS.CIERRE_T25_NORMAL), opts);
	cron.schedule(closingCronExpr(specialT09.end, "*"), () => runScraper(TRIGGERS.CIERRE_T09_SPECIAL), opts);
	cron.schedule(closingCronExpr(specialT25.end, "*"), () => runScraper(TRIGGERS.CIERRE_T25_SPECIAL), opts);
	cron.schedule(closingCronExpr(t08.end, "*"), () => runScraper(TRIGGERS.CIERRE_T08), opts);
	console.log("🚀 Cron Inteligente Inicializado Exclusivamente en Instancia Principal.");
}

export { ACTIVE_SERVERS as A, initCron as i, processGlobalScrape as p };
//# sourceMappingURL=cron-CPn-gAZw.js.map
