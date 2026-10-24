import { b as private_env } from './shared-server-9-2j12mp.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { p as parseIsoDateUTC, i as isWeekendUTC, a as getShift, t as toErpDate, s as shiftDays, b as buildTimeline, c as plantNowAsUtc, d as getOperationalDateStr, e as getPlantParts, f as getShiftAtMinutes } from './plantTime-CoBszG0i.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { p as processGlobalScrape, A as ACTIVE_SERVERS, a as isScrapeRunning, S as SCRAPE_PROCESSES } from './cron-BuUVYFFX.js';
import { f as fail } from './index-CRFfcpCQ.js';
import 'mongodb';
import 'cheerio';
import 'cheerio-tableparser';
import 'node-cron';
import 'node:fs/promises';
import 'node:path';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/custom-scrape/+page.server.js
/** Nombre de piso junto al código ERP. El código es el que filtra el reporte MANTIS. */
var PROCESS_LABELS = {
	BOARD_LABEL: "Laser etch",
	SPI_S1: "SMT side 1",
	SPI_S2: "SMT side 2",
	UNDERFILLAOI: "Underfill",
	AOI_PTH: "PTH",
	XRAY: "X-ray",
	ICT: "ICT",
	PROGRAMMING: "Programming",
	MOL: "MOL",
	SINGULATION: "Singulation",
	LGA_CONTAINMENT: "LGA containment",
	EDGEBONDAOI: "Edgebond",
	ROUTERMILLING: "Router milling",
	ANTENNAATTACH: "Antenna attach",
	LEAKTEST: "Leak test",
	SPRAYCOAT: "Conformal coat",
	SPRAYCOAT_L3: "Conformal coat L3",
	CONT_LOADPCB: "Screwdrive load",
	SCREWDRIVE: "Screwdrive"
};
var PROCESS_IDS = new Set(SCRAPE_PROCESSES);
var processes = SCRAPE_PROCESSES.map((id) => ({
	id,
	label: PROCESS_LABELS[id] || id
}));
var servers = ACTIVE_SERVERS.map((server) => server.name.toUpperCase());
function isForcedProd() {
	return (private_env.FORCE_PROD || process.env.FORCE_PROD) === "true";
}
function serializeLog(log) {
	return {
		server: log.server,
		shift: log.shift,
		status: log.status,
		message: log.message,
		records: log.records,
		timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : null,
		details: {
			upserted: Number(log.details?.upserted) || 0,
			modified: Number(log.details?.modified) || 0
		}
	};
}
function groupRuns(rawLogs) {
	const groups = /* @__PURE__ */ new Map();
	for (const log of rawLogs) {
		const timestamp = log.timestamp instanceof Date ? log.timestamp.toISOString() : null;
		const origin = log.origin || (String(log.shift || "").endsWith("_MANUAL") ? "MANUAL" : "CRON");
		const shift = log.shift || "N/A";
		const key = `${timestamp}|${origin}|${shift}`;
		if (!groups.has(key)) groups.set(key, {
			timestamp,
			origin,
			shift,
			servers: []
		});
		groups.get(key).servers.push({
			server: log.server || "UNKNOWN",
			status: log.status || "PENDING",
			records: Number(log.records) || 0,
			message: log.message || ""
		});
	}
	return [...groups.values()].slice(0, 6).map((run) => {
		const records = run.servers.reduce((sum, server) => sum + server.records, 0);
		const status = run.servers.some((server) => server.status === "ERROR") ? "ERROR" : run.servers.some((server) => server.status === "SUCCESS") ? "SUCCESS" : "PENDING";
		return {
			...run,
			records,
			status
		};
	});
}
var load = async () => {
	const defaultDate = getOperationalDateStr();
	const base = {
		processes,
		servers,
		defaultDate,
		currentShift: "T09",
		holidays: [],
		devMode: false,
		scrapeRunning: isScrapeRunning(),
		recentRuns: [],
		error: null
	};
	try {
		const db = await connectDB();
		const targetDate = parseIsoDateUTC(defaultDate);
		let specialToday = targetDate ? isWeekendUTC(targetDate) : false;
		if (!specialToday) specialToday = await isHoliday(db, defaultDate);
		const plant = getPlantParts();
		const holidayDocs = await db.collection("HOLIDAYS").find({ key: "HOLIDAYS" }).project({
			value: 1,
			description: 1,
			_id: 0
		}).toArray();
		const recentRaw = await db.collection("SCRAPE_LOGS").find({}).sort({ timestamp: -1 }).limit(24).toArray();
		return {
			...base,
			currentShift: getShiftAtMinutes(plant.totalMinutes, specialToday),
			holidays: holidayDocs.filter((doc) => typeof doc.value === "string").map((doc) => ({
				date: doc.value,
				description: typeof doc.description === "string" ? doc.description : ""
			})),
			scrapeRunning: isScrapeRunning(),
			recentRuns: groupRuns(recentRaw)
		};
	} catch (error) {
		console.error("Could not load the custom scrape console:", error);
		return {
			...base,
			error: "Could not load holidays or recent scrapes. The form can still run."
		};
	}
};
var actions = { default: async ({ request }) => {
	const formData = await request.formData();
	const opDate = String(formData.get("opDate") || "");
	const shiftId = String(formData.get("shiftId") || "");
	const selectedProcess = String(formData.get("process") || "").trim().toUpperCase();
	if (!opDate || !shiftId || !selectedProcess) return fail(400, { error: "Choose an operational day, a shift, and a process." });
	if (selectedProcess !== "ALL" && !PROCESS_IDS.has(selectedProcess)) return fail(400, { error: "That process is not on the scrape list." });
	const db = await connectDB();
	const targetDateUTC = parseIsoDateUTC(opDate);
	if (!targetDateUTC) return fail(400, { error: "That operational day is not a valid date." });
	let isSpecialDay = isWeekendUTC(targetDateUTC);
	let holidayName = "";
	if (!isSpecialDay) {
		isSpecialDay = await isHoliday(db, opDate);
		if (isSpecialDay) {
			const holiday = await db.collection("HOLIDAYS").findOne({
				key: "HOLIDAYS",
				value: opDate
			}, { projection: { description: 1 } });
			holidayName = typeof holiday?.description === "string" ? holiday.description : "";
		}
	}
	const selectedShift = getShift(shiftId, isSpecialDay);
	if (!selectedShift) return fail(400, { error: "That shift is not valid." });
	const opDay = {
		year: targetDateUTC.getUTCFullYear(),
		month: targetDateUTC.getUTCMonth() + 1,
		day: targetDateUTC.getUTCDate()
	};
	const fromDateStr = toErpDate(opDay);
	const toDateStr = selectedShift.crossesMidnight ? toErpDate(shiftDays(opDay, 1)) : fromDateStr;
	const requestEcho = {
		opDate,
		shiftId,
		process: selectedProcess,
		special: isSpecialDay,
		holidayName,
		crossesMidnight: selectedShift.crossesMidnight,
		from: `${fromDateStr} ${selectedShift.start}:00`,
		to: `${toDateStr} ${selectedShift.end}:00`
	};
	const scraperConfig = {
		fromDate: fromDateStr,
		fromTime: `${selectedShift.start}:00`,
		toDate: toDateStr,
		toTime: `${selectedShift.end}:00`,
		shiftName: isSpecialDay ? `${shiftId}_SPECIAL` : shiftId,
		isSpecialDay,
		timelineTemplate: buildTimeline(isSpecialDay)
	};
	console.log(`[MANUAL] Scrape ${isForcedProd() ? "PROD" : "DEV"} | ${scraperConfig.shiftName} | ${selectedProcess} | [${scraperConfig.fromDate} ${scraperConfig.fromTime}] -> [${scraperConfig.toDate} ${scraperConfig.toTime}]`);
	const safeUtcDate = plantNowAsUtc();
	try {
		const result = await processGlobalScrape(scraperConfig, selectedProcess);
		const hostErrors = result.hostErrors || {};
		const scrapeSummary = ACTIVE_SERVERS.map((srv) => {
			const serverData = result.perServerCounts?.[srv.name] || { total: 0 };
			const hostError = hostErrors[srv.name] || "";
			const hasData = serverData.total > 0;
			const share = hasData && result.count ? serverData.total / result.count : 0;
			return {
				timestamp: safeUtcDate,
				origin: "MANUAL",
				server: srv.name.toUpperCase(),
				shift: `${shiftId}_MANUAL`,
				status: hostError ? "ERROR" : hasData ? "SUCCESS" : "PENDING",
				message: hostError || (hasData ? "" : "Manual run finished with no records from this host."),
				records: Number(serverData.total) || 0,
				details: {
					upserted: Math.round(share * (result.upserted || 0)),
					modified: Math.round(share * (result.modified || 0))
				}
			};
		});
		await db.collection("SCRAPE_LOGS").insertMany(scrapeSummary);
		return {
			success: true,
			summary: scrapeSummary.map(serializeLog),
			details: {
				intervals: Number(result.count) || 0,
				upserted: Number(result.upserted) || 0,
				modified: Number(result.modified) || 0
			},
			request: requestEcho
		};
	} catch (err) {
		console.error("Manual scrape failed:", err.message);
		const scrapeSummary = ACTIVE_SERVERS.map((srv) => ({
			timestamp: safeUtcDate,
			origin: "MANUAL",
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
		try {
			await db.collection("SCRAPE_LOGS").insertMany(scrapeSummary);
		} catch (logErr) {
			console.error("Could not write the failed scrape to SCRAPE_LOGS:", logErr.message);
		}
		return fail(500, {
			error: "The scrape failed before it could finish writing production data.",
			message: err.message,
			summary: scrapeSummary.map(serializeLog),
			request: requestEcho
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
const component = async () => component_cache ??= (await import('./_page.svelte-D_wSw5kO.js')).default;
const server_id = "src/routes/admin/custom-scrape/+page.server.js";
const imports = ["_app/immutable/nodes/5.Bfe7zPDL.js","_app/immutable/chunks/9CRz70Lm.js","_app/immutable/chunks/vBlyhnAW.js","_app/immutable/chunks/CU36ghjL.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/COzYFV-k.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/BOHdJPtS.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=5-BapDu1eY.js.map
