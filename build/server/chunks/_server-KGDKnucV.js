import { e as getOperationalDayFor, k as toIsoDate, n as isWeekendDay, l as getShiftAtMinutes } from './plantTime-RlOFrl7D.js';
import { j as json } from './index-CRFfcpCQ.js';
import * as cheerio from 'cheerio';
import './index-DBqjc0Yf.js';

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
var EXCLUDED_SYSTEM_PHRASES = [
	"PROCESSED WHILE",
	"RETEST",
	"SKIP",
	"OPERATOR SKIP",
	"SYSTEM AUTOMATIC",
	"NEXT PROCESS",
	"ROUTE COMPLETED",
	"PASSED",
	"GOOD",
	"OK",
	"COMPLETED",
	"ROUTE START"
];
var POST = async ({ request }) => {
	try {
		const { barcode } = await request.json();
		if (!barcode) return json({
			success: false,
			error: "Código de barra unitario requerido."
		}, { status: 400 });
		let html = "";
		let activeServerId = "";
		let foundLegitimateRecord = false;
		for (const srv of APTIV_SERVERS) try {
			const targetAjaxUrl = `${srv.url}?mode=0&unit=${encodeURIComponent(barcode.trim())}&eMode=0`;
			const response = await fetch(targetAjaxUrl, {
				method: "GET",
				headers: {
					"Accept": "text/html",
					"User-Agent": "Mozilla/5.0 Aptiv Forensics"
				},
				timeout: 4e3
			});
			if (response.ok) {
				const tempHtml = await response.text();
				if (tempHtml.includes("Part Number") && tempHtml.includes("Event")) {
					html = tempHtml;
					activeServerId = srv.id;
					foundLegitimateRecord = true;
					break;
				}
			}
		} catch (srvErr) {
			console.warn(`[FORENSIC ENGINE] Nodo ${srv.id} fuera de rango o en mantenimiento.`);
		}
		if (!foundLegitimateRecord || !html) return json({
			success: false,
			error: "Pieza no localizada en ningún nodo del clúster (REMAN61A / REMAN65 / REDBC001)."
		});
		const $ = cheerio.load(html);
		const thPartNumber = $("th:contains('Part Number')");
		if (thPartNumber.length === 0) return json({
			success: false,
			error: "Pieza localizada pero el formato de metadatos de MANTIS está corrupto."
		});
		const metaCells = thPartNumber.closest("table").find("tr").has("td.data").first().find("td.data");
		metaCells.eq(1).text().trim();
		const rawFamilyText = metaCells.eq(2).text().trim();
		const rawPartText = metaCells.eq(3).text().trim();
		const realModel = rawFamilyText.replace(/\s*\(.*\)\s*$/, "").trim().toUpperCase();
		const family = rawFamilyText.replace(/\s*\(.*\)\s*$/, "").trim().toUpperCase();
		const modelPn = rawPartText.replace(/\s*\(.*\)\s*$/, "").trim().toUpperCase();
		const thEventHeader = $("th:contains('Event')").filter((i, el) => $(el).next().text().includes("Process"));
		if (thEventHeader.length === 0) return json({
			success: false,
			error: "La estructura de la tabla de eventos de calidad fue alterada por el ERP."
		});
		const eventRows = thEventHeader.closest("table").find("tr");
		const chronologicalEvents = [];
		let currentMainEvent = null;
		eventRows.each((idx, el) => {
			const tr = $(el);
			if (tr.find("th").length > 0 || tr.text().includes("Next Process")) return;
			const tds = tr.find("td");
			if (tds.length >= 5) {
				const hasScrapClass = tds.eq(0).hasClass("SCRAP") || tds.eq(1).hasClass("SCRAP") || tds.eq(3).hasClass("SCRAP");
				const hasReworkClass = tds.eq(0).hasClass("REWORK") || tds.eq(1).hasClass("REWORK") || tds.eq(3).hasClass("REWORK");
				const hasPassClass = tds.eq(0).hasClass("PASS") || tds.eq(1).hasClass("PASS") || tds.eq(3).hasClass("PASS");
				let visualStatus = "PASS";
				if (hasScrapClass) visualStatus = "SCRAP";
				else if (hasReworkClass) visualStatus = "REWORK";
				else if (hasPassClass) visualStatus = "PASS";
				const rawTs = tds.eq(0).text().trim();
				let eventTimeMs = 0;
				if (rawTs.includes(".")) {
					const [datePart, timePart] = rawTs.split(".");
					const yy = parseInt(`20${datePart.substring(0, 2)}`, 10);
					const mm = parseInt(datePart.substring(2, 4), 10) - 1;
					const dd = parseInt(datePart.substring(4, 6), 10);
					const hrs = parseInt(timePart.substring(0, 2), 10);
					const mins = parseInt(timePart.substring(2, 4), 10);
					const secs = parseInt(timePart.substring(4, 6), 10);
					eventTimeMs = new Date(yy, mm, dd, hrs, mins, secs).getTime();
				}
				currentMainEvent = {
					timestampRaw: rawTs,
					timestampMs: eventTimeMs,
					process: tds.eq(1).text().trim().toUpperCase(),
					machine: tds.eq(2).text().trim().toUpperCase(),
					status: visualStatus,
					subData: []
				};
				const dataKey = tds.eq(4).text().trim().toUpperCase();
				const dataVal = tds.eq(5).text().trim();
				if (dataKey) currentMainEvent.subData.push({
					key: dataKey,
					val: dataVal
				});
				chronologicalEvents.push(currentMainEvent);
			} else if (tds.length === 2 && currentMainEvent) {
				const dataKey = tds.eq(0).text().trim().toUpperCase();
				const dataVal = tds.eq(1).text().trim();
				if (dataKey) currentMainEvent.subData.push({
					key: dataKey,
					val: dataVal
				});
			}
		});
		chronologicalEvents.reverse();
		const processLifeCycle = {};
		chronologicalEvents.forEach((ev) => {
			if (!processLifeCycle[ev.process]) processLifeCycle[ev.process] = {
				hasFailed: false,
				hasBeenHealed: false,
				firstFailure: null,
				lastStatus: "PASS"
			};
			const cycle = processLifeCycle[ev.process];
			if (ev.status === "REWORK" || ev.status === "SCRAP") {
				if (ev.subData.some((d) => {
					if (!d.val) return false;
					const valUpper = d.val.toUpperCase();
					return !EXCLUDED_SYSTEM_PHRASES.some((phrase) => valUpper.includes(phrase));
				}) && !cycle.hasFailed) {
					cycle.hasFailed = true;
					cycle.firstFailure = ev;
				}
				cycle.lastStatus = ev.status;
			}
			if (ev.status === "PASS" && cycle.hasFailed) {
				cycle.hasBeenHealed = true;
				cycle.hasFailed = false;
				cycle.firstFailure = null;
				cycle.lastStatus = "PASS";
			}
		});
		let ultimateFailureEvent = null;
		for (const ev of chronologicalEvents) {
			const cycle = processLifeCycle[ev.process];
			if (ev.status !== "PASS" && cycle && cycle.hasFailed && cycle.firstFailure) {
				let selectedDefectDetail = "FALLA CRÍTICA EN CADENA DE MONTAJE";
				const commentRow = ev.subData.find((d) => d.key === "COMMENT");
				const scrapRow = ev.subData.find((d) => d.key === "SCRAP");
				const defectRow = ev.subData.find((d) => d.key === "DEFECT" || d.key === "REVIEWED_DEFECT");
				const attributesRow = ev.subData.find((d) => d.key === "ATTRIBUTES");
				if (commentRow && commentRow.val) selectedDefectDetail = commentRow.val;
				else if (scrapRow && scrapRow.val) selectedDefectDetail = scrapRow.val;
				else if (defectRow && defectRow.val) selectedDefectDetail = defectRow.val.split(",").filter(Boolean).join(" ");
				else if (attributesRow && attributesRow.val.includes("MAP,")) selectedDefectDetail = "FALLA DE PRUEBA ELÉCTRICA / PARAMÉTRICA";
				const cleanUpper = selectedDefectDetail.toUpperCase();
				if (!(EXCLUDED_SYSTEM_PHRASES.some((p) => cleanUpper.includes(p)) && !cleanUpper.includes("BY")) && selectedDefectDetail.trim() !== "") {
					ultimateFailureEvent = {
						timestamp: cycle.firstFailure.timestampRaw,
						process: cycle.firstFailure.process,
						machine: cycle.firstFailure.machine,
						failure: selectedDefectDetail.replace(/^FA-\d{4}\s+/i, "").trim().toUpperCase()
					};
					break;
				}
			}
		}
		if (!ultimateFailureEvent) {
			const lastScrapEvent = [...chronologicalEvents].reverse().find((e) => e.status === "SCRAP");
			if (lastScrapEvent) {
				const comment = lastScrapEvent.subData.find((d) => d.val)?.val || "BAJA POR CONTROL DE CALIDAD";
				ultimateFailureEvent = {
					timestamp: lastScrapEvent.timestampRaw,
					process: lastScrapEvent.process,
					machine: lastScrapEvent.machine,
					failure: comment.replace(/^FA-\d{4}\s+/i, "").trim().toUpperCase()
				};
			}
		}
		if (!ultimateFailureEvent) return json({
			success: false,
			error: "La pieza cuenta con estatus PASS continuo. No requiere ticket de Scrap."
		});
		const tCode = ultimateFailureEvent.timestamp;
		const yy = `20${tCode.substring(0, 2)}`;
		const mm = parseInt(tCode.substring(2, 4), 10) - 1;
		const dd = parseInt(tCode.substring(4, 6), 10);
		const hrs = parseInt(tCode.substring(7, 9), 10);
		const mins = parseInt(tCode.substring(9, 11), 10);
		const failureDateLocal = new Date(yy, mm, dd, hrs, mins, 0);
		const opDay = getOperationalDayFor({
			year: Number(yy),
			month: mm + 1,
			day: dd,
			hour: hrs,
			minute: mins
		});
		const opDateStr = toIsoDate(opDay);
		const isSpecialDay = isWeekendDay(opDay.weekday);
		const shift = getShiftAtMinutes(hrs * 60 + mins, isSpecialDay);
		return json({
			success: true,
			barcode: barcode.trim(),
			model: realModel,
			partNumber: modelPn,
			family: family.toUpperCase(),
			machine: ultimateFailureEvent.machine,
			process: ultimateFailureEvent.process,
			failure: ultimateFailureEvent.failure,
			operationalDay: opDateStr,
			shift,
			exactTime: failureDateLocal.toLocaleString("es-MX"),
			serverSource: activeServerId
		});
	} catch (error) {
		console.error("❌ Error crítico en API de Clúster Forense de Alta Gama:", error);
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
};

export { POST };
//# sourceMappingURL=_server-KGDKnucV.js.map
