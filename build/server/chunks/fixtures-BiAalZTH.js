import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import path from 'node:path';

//#region src/lib/server/scrap/classify.js
/**
* ERP process → valuestream column. AOI side 1/2 belongs to SMT; the production
* alias map only names SPI because that is what the hourly report aggregates.
*/
var PLANT_PROCESS = {
	BOARD_LABEL: "LASER ETCH",
	SPI_S1: "SMT",
	SPI_S2: "SMT",
	AOI_S1: "SMT",
	AOI_S2: "SMT",
	UNDERFILLAOI: "UNDERFILL",
	AOI_PTH: "PTH",
	XRAY: "XRAY",
	ICT: "ICT",
	PROGRAMMING: "PROGRAMMING",
	MOL: "PROGRAMMING",
	SINGULATION: "SINGULATION",
	LGA_CONTAINMENT: "LGA CONTAINMENT",
	EDGEBONDAOI: "EDGEBOND",
	EDGEBONDDISPENSE: "EDGEBOND",
	ROUTERMILLING: "ROUTERMILLING",
	ANTENNAATTACH: "ANTENNA ATTACH",
	LEAKTEST: "LEAKTEST",
	SPRAYCOAT: "CONFORMAL",
	SPRAYCOAT_L3: "CONFORMAL",
	CONT_LOADPCB: "SCREWDRIVE",
	SCREWDRIVE: "SCREWDRIVE"
};
var NOISE = [
	"PROCESSED WHILE",
	"RETEST",
	"OPERATOR SKIP",
	"SYSTEM AUTOMATIC",
	"NEXT PROCESS",
	"ROUTE COMPLETED",
	"ROUTE START",
	"PASSED",
	"COMPLETED"
];
/** @param {string} value */
function cleanLabel(value) {
	return String(value || "").replace(/\s+/g, " ").replace(/\s*\([^)]*\)\s*$/g, "").trim().toUpperCase();
}
/** @param {string} value */
function eightDigit(value) {
	const match = String(value || "").match(/\d{8}/);
	return match ? match[0] : "";
}
/** @param {string} value */
function isNoise(value) {
	const upper = String(value || "").toUpperCase();
	if (!upper.trim()) return true;
	return NOISE.some((phrase) => upper.includes(phrase));
}
/** `COMP,Q201-0,MISSING,` → `COMP, Q201-0, MISSING` */
function formatList(value) {
	return String(value || "").split(",").map((part) => part.trim()).filter((part) => part && !isNoise(part)).join(", ").toUpperCase();
}
/** @param {{ subData: { key: string, val: string }[] }} event @param {string} key */
function field(event, key) {
	return event.subData.find((row) => row.key === key)?.val?.trim() || "";
}
/** Equipment defect wins. A review code is only used when the station itself has no DEFECT. */
function defectLabel(event) {
	const defect = formatList(field(event, "DEFECT"));
	if (defect) return defect;
	const reviewed = formatList(field(event, "REVIEWED_DEFECT"));
	if (reviewed) return reviewed;
	const comment = field(event, "COMMENT");
	if (comment && !isNoise(comment)) return comment.toUpperCase();
	return "";
}
function isProcessedWhileScrap(event) {
	return event.subData.some((row) => String(row.val || "").toUpperCase().includes("PROCESSED WHILE"));
}
function isAdminTicket(event) {
	if (event.process === "ADMIN") return true;
	return event.machine === "WEB" && event.subData.some((row) => row.key === "WEBEVENT");
}
/** AOI_DIAG confirms the previous rejection. It does not open a new process. */
function isDiagnostic(event) {
	if (event.process.includes("DIAG")) return true;
	const reviewed = field(event, "REVIEWED_DEFECT");
	const defect = field(event, "DEFECT");
	return Boolean(reviewed) && !defect;
}
/** @param {string} raw `260509.085550` */
function parseMantisStamp(raw) {
	if (!/^\d{6}\.\d{6}$/.test(raw || "")) return null;
	return {
		year: 2e3 + Number(raw.slice(0, 2)),
		month: Number(raw.slice(2, 4)),
		day: Number(raw.slice(4, 6)),
		hour: Number(raw.slice(7, 9)),
		minute: Number(raw.slice(9, 11)),
		second: Number(raw.slice(11, 13)),
		raw
	};
}
function plantProcessFor(serverProcess) {
	if (!serverProcess) return "UNASSIGNED";
	return PLANT_PROCESS[serverProcess] || serverProcess;
}
/**
* MANTIS prints the newest event first. Sub-rows hang off the rowspan of the
* event above them and only carry the data pair.
* @param {string} html
*/
function parseUnitHistory(html) {
	const $ = cheerio.load(html);
	const meta = $("th:contains('Part Number')").closest("table").find("tr").has("td.data").first().find("td.data");
	const header = {
		barcode: (meta.eq(0).text().match(/\d{8,}/) || [""])[0],
		routeKey: cleanLabel(meta.eq(1).text()),
		erpFamily: cleanLabel(meta.eq(2).text()),
		erpPart: eightDigit(meta.eq(3).text()) || cleanLabel(meta.eq(3).text()),
		productType: cleanLabel(meta.eq(4).text())
	};
	const eventHeader = $("th:contains('Event')").filter((_, el) => $(el).next().text().includes("Process"));
	const events = [];
	let current = null;
	eventHeader.closest("table").find("tr").each((_, el) => {
		const tr = $(el);
		if (tr.find("th").length > 0 || tr.text().includes("Next Process")) return;
		const cells = tr.find("td");
		if (cells.length >= 5) {
			const statusText = cells.eq(3).text().trim().toUpperCase();
			const scrap = cells.eq(0).hasClass("SCRAP") || cells.eq(3).hasClass("SCRAP") || statusText === "SCRAP";
			const rework = cells.eq(0).hasClass("REWORK") || cells.eq(3).hasClass("REWORK") || statusText === "REWORK";
			const pass = cells.eq(0).hasClass("PASS") || cells.eq(3).hasClass("PASS") || statusText === "PASS";
			let status = "OTHER";
			if (scrap) status = "SCRAP";
			else if (rework) status = "REWORK";
			else if (pass) status = "PASS";
			current = {
				timestampRaw: cells.eq(0).text().trim(),
				process: cells.eq(1).text().trim().toUpperCase(),
				machine: cells.eq(2).text().trim().toUpperCase(),
				status,
				subData: []
			};
			const key = cells.eq(4).text().trim().toUpperCase();
			const val = cells.eq(5).text().replace(/\u00a0/g, " ").trim();
			if (key) current.subData.push({
				key,
				val
			});
			events.push(current);
			return;
		}
		if (cells.length === 2 && current) {
			const key = cells.eq(0).text().trim().toUpperCase();
			const val = cells.eq(1).text().replace(/\u00a0/g, " ").trim();
			if (key) current.subData.push({
				key,
				val
			});
		}
	});
	events.reverse();
	return {
		header,
		events
	};
}
function trailRow(event, role, note) {
	return {
		time: event.timestampRaw,
		process: event.process,
		station: event.machine,
		role,
		note: note || ""
	};
}
function ticketNote(event) {
	return [field(event, "SCRAP"), field(event, "COMMENT")].filter((part) => part && !isNoise(part)).join(" · ").toUpperCase();
}
/**
* The last process that still has a fail or rework disposes the piece.
* A later pass of that same process recovers it. A DIAG station confirms the
* previous defect. ADMIN/WEB is the scrap ticket. "Processed while scrap"
* means the unit was already dead and kept moving.
* @param {string} html
*/
function classifyUnit(html) {
	const { header, events } = parseUnitHistory(html);
	const trail = [];
	/** @type {{ event: any, review: string, recovered: boolean, diagnosticOnly: boolean }[]} */
	const rejections = [];
	for (const event of events) {
		if (!event.process || event.process === "AUTOCREATE") continue;
		if (isProcessedWhileScrap(event)) {
			trail.push(trailRow(event, "ignored", "Processed while scrap"));
			continue;
		}
		if (isAdminTicket(event)) {
			trail.push(trailRow(event, "ticket", ticketNote(event)));
			continue;
		}
		if (event.status === "PASS") {
			for (const rejection of rejections) {
				if (rejection.event.process !== event.process || rejection.recovered) continue;
				rejection.recovered = true;
				const prior = trail.find((row) => row.time === rejection.event.timestampRaw && row.process === rejection.event.process && row.role === "rejection");
				if (prior) prior.role = "recovered";
			}
			trail.push(trailRow(event, "pass", ""));
			continue;
		}
		if (event.status !== "REWORK" && event.status !== "SCRAP") {
			trail.push(trailRow(event, "pass", event.status));
			continue;
		}
		if (isDiagnostic(event)) {
			const note = formatList(field(event, "REVIEWED_DEFECT")) || defectLabel(event);
			const open = [...rejections].reverse().find((row) => !row.recovered);
			if (open) open.review = note;
			else rejections.push({
				event,
				review: note,
				recovered: false,
				diagnosticOnly: true
			});
			trail.push(trailRow(event, "review", note));
			continue;
		}
		rejections.push({
			event,
			review: "",
			recovered: false,
			diagnosticOnly: false
		});
		trail.push(trailRow(event, "rejection", defectLabel(event)));
	}
	const ticket = [...events].reverse().find((event) => isAdminTicket(event) && !isProcessedWhileScrap(event)) || null;
	const chosen = [...rejections].reverse().find((row) => !row.recovered) || null;
	if (chosen) {
		const row = trail.find((item) => item.time === chosen.event.timestampRaw && item.process === chosen.event.process && (item.role === "rejection" || item.role === "review"));
		if (row) row.role = "disposition";
	}
	const sourceEvent = chosen?.event || null;
	const defect = chosen ? defectLabel(sourceEvent) || chosen.review || "UNSTATED DEFECT" : "";
	const comment = (ticket ? field(ticket, "COMMENT") : "") || (sourceEvent ? field(sourceEvent, "COMMENT") : "");
	const scrapCode = ticket ? field(ticket, "SCRAP") : "";
	const stamp = parseMantisStamp(sourceEvent?.timestampRaw || ticket?.timestampRaw || "");
	const smtPart = eightDigit(field(sourceEvent || { subData: [] }, "SMT_PART")) || events.map((event) => eightDigit(field(event, "SMT_PART"))).find(Boolean) || "";
	let kind = "NONE";
	if (chosen) kind = "PROCESS";
	else if (ticket) kind = "TICKET";
	const serverProcess = chosen ? sourceEvent.process : "";
	return {
		...header,
		kind,
		serverProcess,
		plantProcess: plantProcessFor(serverProcess),
		station: sourceEvent?.machine || "",
		defect: kind === "PROCESS" ? defect : (comment || scrapCode || "UNSTATED DEFECT").toUpperCase(),
		review: chosen?.review || "",
		scrapCode: isNoise(scrapCode) ? "" : scrapCode.toUpperCase(),
		comment: isNoise(comment) ? "" : comment.toUpperCase(),
		operator: ticket ? field(ticket, "OPERATOR") : "",
		smtPart,
		map: field(sourceEvent || { subData: [] }, "MAP"),
		mapBadBoards: field(sourceEvent || { subData: [] }, "MAP_BAD_BOARDS"),
		occurredAt: stamp,
		trail
	};
}
//#endregion
//#region src/lib/server/scrap/fixtures.js
var FIXTURE_DIR = path.join(process.cwd(), "src/lib/server/scrap/fixtures");
var REFERENCE = path.join(process.cwd(), "static", "[REMAN65] MANTIS_ View Unit History.html");
/** What each sample is meant to prove. The barcode is the unit inside the HTML. */
var FIXTURE_NOTES = {
	"15326129013205": "AOI side 1 rejects Q201. Diagnosis confirms it. Later stations already see scrap.",
	"26110700000001": "Rework only. No scrap ticket. ICT is the disposition.",
	"26110700000002": "AOI fails, then ICT fails. The last open process wins.",
	"26110700000003": "AOI is recovered by a later pass. XRAY disposes the piece.",
	"26110700000004": "Scrap ticket and a comment. No equipment defect."
};
/** Development reads the sample histories. A forced production run still calls the ERP. */
function usesFixtureHistory() {
	return false;
}
var cache = null;
async function readAll() {
	if (cache) return cache;
	const files = [{
		file: REFERENCE,
		server: "REMAN65"
	}];
	const names = await fs.readdir(FIXTURE_DIR).catch(() => []);
	for (const name of names) {
		if (!name.endsWith(".html")) continue;
		files.push({
			file: path.join(FIXTURE_DIR, name),
			server: "REMAN65"
		});
	}
	const loaded = [];
	for (const entry of files) {
		const html = await fs.readFile(entry.file, "utf8").catch(() => "");
		if (!html.includes("Part Number") || !html.includes("Event")) continue;
		const unit = classifyUnit(html);
		if (!unit.barcode) continue;
		loaded.push({
			...entry,
			html,
			unit
		});
	}
	cache = loaded;
	return loaded;
}
/** @param {string} barcode */
async function loadFixture(barcode) {
	const wanted = String(barcode || "").trim().toUpperCase();
	return (await readAll()).find((entry) => entry.unit.barcode === wanted) || null;
}
/** Short cards for the dev rack. Classification is the parser's, not a handwritten expectation. */
async function listFixtureSamples() {
	return (await readAll()).map((entry) => ({
		barcode: entry.unit.barcode,
		note: FIXTURE_NOTES[entry.unit.barcode] || "Sample unit history",
		serverProcess: entry.unit.serverProcess || "UNASSIGNED",
		plantProcess: entry.unit.plantProcess,
		defect: entry.unit.defect,
		erpFamily: entry.unit.erpFamily,
		erpPart: entry.unit.erpPart,
		kind: entry.unit.kind
	}));
}

export { listFixtureSamples as a, classifyUnit as c, loadFixture as l, usesFixtureHistory as u };
//# sourceMappingURL=fixtures-BiAalZTH.js.map
