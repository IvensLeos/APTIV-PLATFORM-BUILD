import { c as connectDB } from './db-CJixkQQl.js';
import { i as isWeekendDay, a as getShiftAtMinutes } from './shifts-BYGd7DZC.js';
import { d as getOperationalDayFor, e as toIsoDate } from './plantTime-C6hdc3to.js';
import { i as isHoliday } from './holidays-CLGlgZFg.js';
import { u as usesFixtureHistory, l as loadFixture, a as listFixtureSamples, c as classifyUnit } from './fixtures-BiAalZTH.js';
import { j as json } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import 'cheerio';
import 'node:fs/promises';
import 'node:path';
import './index-DBqjc0Yf.js';

//#region src/lib/server/scrap/catalog.js
/** Eight-digit part numbers are the same shape OEES and ITEMS already use. */
function eightDigit(value) {
	const match = String(value || "").match(/\d{8}/);
	return match ? match[0] : "";
}
async function findItem(db, part) {
	if (!db || !part) return null;
	return db.collection("ITEMS").findOne({ PARTNUMBER: part }, { projection: {
		_id: 0,
		PARTNUMBER: 1,
		FAMILY: 1,
		TYPE: 1,
		LEVEL: 1
	} });
}
async function realPart(db, serverPart, serverProcess) {
	if (!db || !serverPart) return "";
	if (serverProcess) {
		const exact = await db.collection("PART_CONVERSIONS").findOne({
			SERVER_PARTNUMBER: serverPart,
			SERVER_PROCESS: serverProcess
		}, { projection: {
			_id: 0,
			REAL_PARTNUMBER: 1
		} });
		if (exact?.REAL_PARTNUMBER) return String(exact.REAL_PARTNUMBER);
	}
	const any = await db.collection("PART_CONVERSIONS").findOne({ SERVER_PARTNUMBER: serverPart }, { projection: {
		_id: 0,
		REAL_PARTNUMBER: 1
	} });
	return any?.REAL_PARTNUMBER ? String(any.REAL_PARTNUMBER) : "";
}
/**
* Family and the real part come from ITEMS. The ERP family string is only a
* fallback when the catalog has no row. STATIONS supplies the plant machine
* name when the rejecting station is mapped.
* @param {import('mongodb').Db | null} db
* @param {ReturnType<import('./classify.js').classifyUnit>} unit
*/
async function resolveCatalog(db, unit) {
	const erpPart = eightDigit(unit.erpPart) || eightDigit(unit.smtPart);
	const fallback = {
		partNumber: erpPart || unit.erpPart || "",
		family: unit.erpFamily || "UNKNOWN",
		type: "",
		level: "",
		familySource: "ERP",
		machine: unit.station || ""
	};
	if (!db) return fallback;
	try {
		let item = await findItem(db, erpPart);
		if (!item) {
			const converted = await realPart(db, erpPart, unit.serverProcess);
			item = await findItem(db, eightDigit(converted) || converted);
		}
		if (!item && unit.smtPart && unit.smtPart !== erpPart) item = await findItem(db, unit.smtPart);
		let machine = unit.station || "";
		let plantProcess = unit.plantProcess;
		if (unit.station) {
			const station = await db.collection("STATIONS").findOne({ STATION: unit.station }, { projection: {
				_id: 0,
				MACHINE: 1,
				PROCESS: 1
			} });
			if (station?.MACHINE) machine = station.MACHINE;
			if (station?.PROCESS) plantProcess = station.PROCESS;
		}
		if (!item) return {
			...fallback,
			machine,
			plantProcess
		};
		return {
			partNumber: item.PARTNUMBER,
			family: item.FAMILY || fallback.family,
			type: item.TYPE || "",
			level: item.LEVEL || "",
			familySource: "ITEMS",
			machine,
			plantProcess
		};
	} catch (error) {
		console.warn("[scrap] Catalog lookup skipped:", error?.message || error);
		return fallback;
	}
}
//#endregion
//#region src/routes/api/scrape/scrap-tickets/+server.js
var APTIV_SERVERS = [
	{
		id: "REMAN65",
		url: "https://reman65.aptiv.com/std_public/unithistory"
	},
	{
		id: "REMAN61A",
		url: "https://reman61a.aptiv.com/std_public/unithistory"
	},
	{
		id: "REDBC001",
		url: "https://redbc001.aptiv.com/std_public/unithistory"
	}
];
async function readLiveHistory(barcode) {
	for (const server of APTIV_SERVERS) try {
		const target = `${server.url}?mode=0&unit=${encodeURIComponent(barcode)}&eMode=0`;
		const response = await fetch(target, {
			method: "GET",
			headers: {
				Accept: "text/html",
				"User-Agent": "Mozilla/5.0 Aptiv Platform"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (!response.ok) continue;
		const html = await response.text();
		if (html.includes("Part Number") && html.includes("Event")) return {
			html,
			serverId: server.id
		};
	} catch (error) {
		console.warn(`[scrap] ${server.id} did not answer:`, error?.message || error);
	}
	return null;
}
function pad(value) {
	return String(value).padStart(2, "0");
}
async function stampShift(db, occurredAt) {
	if (!occurredAt) return {
		operationalDay: "",
		shift: "",
		occurredAt: ""
	};
	const opDay = getOperationalDayFor(occurredAt);
	const operationalDay = toIsoDate(opDay);
	const special = isWeekendDay(opDay.weekday) || await isHoliday(db, operationalDay);
	return {
		operationalDay,
		shift: getShiftAtMinutes(occurredAt.hour * 60 + occurredAt.minute, special),
		occurredAt: `${occurredAt.year}-${pad(occurredAt.month)}-${pad(occurredAt.day)} ${pad(occurredAt.hour)}:${pad(occurredAt.minute)}:${pad(occurredAt.second)}`
	};
}
var POST = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const barcode = String(body.barcode || "").trim().toUpperCase();
		if (!barcode) return json({
			success: false,
			error: "Scan a unit serial."
		}, { status: 400 });
		const fixtureMode = usesFixtureHistory();
		let html = "";
		let serverSource = "";
		let source = "erp";
		if (fixtureMode) ; else {
			const live = await readLiveHistory(barcode);
			if (!live) return json({
				success: false,
				error: "Unit not found on REMAN61A, REMAN65, or REDBC001."
			}, { status: 404 });
			html = live.html;
			serverSource = live.serverId;
		}
		const unit = classifyUnit(html);
		if (unit.kind === "NONE") return json({
			success: false,
			error: "This unit has no scrap or rework to classify."
		}, { status: 422 });
		let db = null;
		try {
			db = await connectDB();
		} catch (error) {
			console.warn("[scrap] Database unavailable:", error?.message || error);
		}
		const catalog = await resolveCatalog(db, unit);
		const when = await stampShift(db, unit.occurredAt);
		return json({
			success: true,
			barcode: unit.barcode || barcode,
			family: catalog.family,
			familySource: catalog.familySource,
			type: catalog.type,
			level: catalog.level,
			partNumber: catalog.partNumber,
			erpFamily: unit.erpFamily,
			erpPart: unit.erpPart,
			plantProcess: catalog.plantProcess || unit.plantProcess,
			serverProcess: unit.serverProcess || "UNASSIGNED",
			station: unit.station,
			machine: catalog.machine || unit.station,
			defect: unit.defect,
			review: unit.review,
			scrapCode: unit.scrapCode,
			comment: unit.comment,
			operator: unit.operator,
			map: unit.map,
			mapBadBoards: unit.mapBadBoards,
			kind: unit.kind,
			trail: unit.trail,
			serverSource,
			source,
			...when
		});
	} catch (error) {
		console.error("[scrap] Classification failed:", error);
		return json({
			success: false,
			error: "The unit history could not be classified."
		}, { status: 500 });
	}
};

export { POST };
//# sourceMappingURL=_server-Bb7GKE8u.js.map
