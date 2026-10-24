import { r as requireRole } from './access-DhuzMuXb.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { c as plantNowAsUtc } from './plantTime-CoBszG0i.js';
import { i as isOeesPartNumber, d as describeConversion } from './partConversion-NydKHFLM.js';
import { j as json } from './index-CRFfcpCQ.js';
import * as cheerio from 'cheerio';
import cheerioTableparser from 'cheerio-tableparser';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/scrape/custom/+server.js
var SERVERS = [
	{
		id: "REMAN61A",
		host: "reman61a.aptiv.com"
	},
	{
		id: "REMAN65",
		host: "reman65.aptiv.com"
	},
	{
		id: "REDBC001",
		host: "redbc001.aptiv.com"
	}
];
var SERVER_IDS = new Set(SERVERS.map((server) => server.id));
var SPI_S2_VARIANTS = [
	"AOI_PTH",
	"XRAY",
	"ICT"
];
var MAX_COMMIT = 5e3;
var text$1 = (value) => String(value ?? "").trim().toUpperCase();
function errorText(error) {
	const cause = error?.cause;
	if (cause?.code === "ENOTFOUND") return `Host not found${cause.hostname ? ` (${cause.hostname})` : ""}.`;
	if (cause?.code) return cause.message ? `${cause.code}: ${cause.message}` : cause.code;
	return error?.message || "Network error";
}
function parseIsoDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
	return date;
}
function formatErpDate(date) {
	return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCFullYear()).slice(-2)}`;
}
async function loadCatalog(db) {
	const rows = await db.collection("PART_CONVERSIONS").find({}, { projection: {
		SERVER_PARTNUMBER: 1,
		SERVER_PROCESS: 1,
		REAL_PARTNUMBER: 1
	} }).toArray();
	return new Map(rows.map((row) => [`${row.SERVER_PARTNUMBER}|${row.SERVER_PROCESS}`, text$1(row.REAL_PARTNUMBER)]));
}
function remember(map, record) {
	const serverPart = text$1(record.SERVER_PARTNUMBER);
	const serverProcess = text$1(record.SERVER_PROCESS);
	const realPart = text$1(record.REAL_PARTNUMBER);
	if (!serverPart || !serverProcess) return;
	const key = `${serverPart}|${serverProcess}`;
	const source = SERVER_IDS.has(text$1(record.SERVER_SOURCE)) ? text$1(record.SERVER_SOURCE) : "";
	const family = text$1(record.FAMILY) || "N/A";
	const current = map.get(key);
	if (!current) {
		map.set(key, {
			SERVER_PARTNUMBER: serverPart,
			SERVER_PROCESS: serverProcess,
			REAL_PARTNUMBER: realPart,
			FAMILY: family,
			SERVER_SOURCE: source,
			sources: source ? [source] : []
		});
		return;
	}
	if (source && !current.sources.includes(source)) current.sources.push(source);
	if (!isOeesPartNumber(current.REAL_PARTNUMBER) && isOeesPartNumber(realPart)) {
		current.REAL_PARTNUMBER = realPart;
		current.FAMILY = family;
		if (source) current.SERVER_SOURCE = source;
	} else if (source) current.SERVER_SOURCE = source;
}
var POST = async ({ request, locals }) => {
	requireRole(locals, ["SUPERVISOR", "ADMIN"]);
	try {
		const body = await request.json();
		const action = body.action === "commit" ? "commit" : "preview";
		const db = await connectDB();
		const result = action === "commit" ? await commitConversions(db, body.records) : await previewWindow(db, body);
		return json(result, { status: result.success ? 200 : 400 });
	} catch (error) {
		if (typeof error?.status === "number") throw error;
		console.error("Conversions scrape failed:", error);
		return json({
			success: false,
			error: error.message || "Could not scrape conversions."
		}, { status: 500 });
	}
};
async function previewWindow(db, body) {
	const target = parseIsoDate(body.targetDateStr);
	const mode = body.mode === "BOARD_LABEL" ? "BOARD_LABEL" : "SPI";
	if (!target) return {
		success: false,
		error: "Choose a valid newer date."
	};
	const isBoardLabel = mode === "BOARD_LABEL";
	const optionsQuery = isBoardLabel ? "-group+process+partnumber+BOARD_LOTCODE+productfamily" : "-group+process+partnumber+MODEL+productfamily";
	const processList = isBoardLabel ? "BOARD_LABEL" : "SPI_S1,SPI_S2";
	const dateStart = new Date(target);
	dateStart.setUTCDate(dateStart.getUTCDate() - 2);
	const strFrom = formatErpDate(dateStart);
	const strTo = formatErpDate(target);
	const catalog = await loadCatalog(db);
	const found = /* @__PURE__ */ new Map();
	const logs = [];
	for (const server of SERVERS) {
		const targetUrl = `https://${server.host}/std_public/wipreports?report=X_MANTIS&options=${optionsQuery}&processSList=${processList}&from=${strFrom}&to=${strTo}&maxevents=500000000&mode=1`;
		try {
			const response = await fetch(targetUrl);
			if (!response.ok) {
				logs.push({
					server: server.id,
					type: "error",
					message: `HTTP ${response.status}`,
					count: 0
				});
				continue;
			}
			const html = (await response.text()).replace(/&nbsp;/g, "");
			const $ = cheerio.load(html);
			cheerioTableparser($);
			const tableData = $("table").eq(1).parsetable(false, true, true);
			if (!tableData || tableData.length < 4) {
				logs.push({
					server: server.id,
					type: "warning",
					message: "Report table was empty or unreadable.",
					count: 0
				});
				continue;
			}
			let read = 0;
			let lastProcess = "";
			const totalRows = tableData[0].length;
			for (let i = 1; i < totalRows; i++) {
				const currentProcess = text$1(tableData[0]?.[i]);
				const partNumber = text$1(tableData[1]?.[i]);
				const rawModelOrLot = text$1(tableData[2]?.[i]);
				const productFamily = text$1(tableData[3]?.[i]);
				if (!currentProcess && !partNumber && !rawModelOrLot && !productFamily) continue;
				lastProcess = currentProcess || lastProcess;
				if (!partNumber || !lastProcess) continue;
				read += 1;
				const realPart = rawModelOrLot ? isBoardLabel ? rawModelOrLot.slice(0, 8) : rawModelOrLot : "UNCODED_MODEL";
				const base = {
					SERVER_PARTNUMBER: partNumber,
					SERVER_PROCESS: lastProcess,
					REAL_PARTNUMBER: realPart,
					FAMILY: productFamily || "N/A",
					SERVER_SOURCE: server.id
				};
				remember(found, base);
				if (!isBoardLabel && lastProcess === "SPI_S2") for (const variant of SPI_S2_VARIANTS) remember(found, {
					...base,
					SERVER_PROCESS: variant
				});
			}
			logs.push({
				server: server.id,
				type: read ? "success" : "warning",
				message: read ? `Found ${read} report rows.` : "No part rows in this window.",
				count: read
			});
		} catch (error) {
			logs.push({
				server: server.id,
				type: "error",
				message: errorText(error),
				count: 0
			});
		}
	}
	const records = Array.from(found.values()).map((record) => {
		const existingReal = catalog.has(`${record.SERVER_PARTNUMBER}|${record.SERVER_PROCESS}`) ? catalog.get(`${record.SERVER_PARTNUMBER}|${record.SERVER_PROCESS}`) : null;
		const described = describeConversion(record.SERVER_PARTNUMBER, record.REAL_PARTNUMBER, existingReal);
		return {
			...record,
			existingReal,
			status: described.status,
			reason: described.reason
		};
	});
	return {
		success: true,
		mode,
		range: {
			from: strFrom,
			to: strTo
		},
		nextDateStr: dateStart.toISOString().slice(0, 10),
		logs,
		records
	};
}
async function commitConversions(db, incoming) {
	if (!Array.isArray(incoming) || incoming.length === 0) return {
		success: false,
		error: "Select at least one conversion."
	};
	if (incoming.length > MAX_COMMIT) return {
		success: false,
		error: `Confirm ${MAX_COMMIT} rows or fewer at a time.`
	};
	const catalog = await loadCatalog(db);
	const accepted = /* @__PURE__ */ new Map();
	let skipped = 0;
	for (const row of incoming) {
		const serverPart = text$1(row?.SERVER_PARTNUMBER);
		const serverProcess = text$1(row?.SERVER_PROCESS);
		const realPart = text$1(row?.REAL_PARTNUMBER);
		if (!isOeesPartNumber(serverPart) || !serverProcess || !isOeesPartNumber(realPart)) {
			skipped += 1;
			continue;
		}
		const source = SERVER_IDS.has(text$1(row?.SERVER_SOURCE)) ? text$1(row.SERVER_SOURCE) : "";
		accepted.set(`${serverPart}|${serverProcess}`, {
			SERVER_PARTNUMBER: serverPart,
			SERVER_PROCESS: serverProcess,
			REAL_PARTNUMBER: realPart,
			FAMILY: text$1(row?.FAMILY) || "N/A",
			SERVER_SOURCE: source
		});
	}
	const operations = [];
	const savedKeys = [];
	let inserted = 0;
	let updated = 0;
	const updatedAt = plantNowAsUtc();
	for (const record of accepted.values()) {
		const key = `${record.SERVER_PARTNUMBER}|${record.SERVER_PROCESS}`;
		const existingReal = catalog.get(key);
		if (existingReal === record.REAL_PARTNUMBER) {
			skipped += 1;
			continue;
		}
		if (existingReal === void 0) inserted += 1;
		else updated += 1;
		const $set = {
			SERVER_PARTNUMBER: record.SERVER_PARTNUMBER,
			SERVER_PROCESS: record.SERVER_PROCESS,
			REAL_PARTNUMBER: record.REAL_PARTNUMBER,
			FAMILY: record.FAMILY,
			UPDATED_AT: updatedAt
		};
		if (record.SERVER_SOURCE) $set.SERVER_SOURCE = record.SERVER_SOURCE;
		operations.push({ updateOne: {
			filter: {
				SERVER_PARTNUMBER: record.SERVER_PARTNUMBER,
				SERVER_PROCESS: record.SERVER_PROCESS
			},
			update: { $set },
			upsert: true
		} });
		savedKeys.push(key);
	}
	if (operations.length) await db.collection("PART_CONVERSIONS").bulkWrite(operations, { ordered: false });
	return {
		success: true,
		inserted,
		updated,
		skipped,
		savedKeys
	};
}

export { POST };
//# sourceMappingURL=_server-DDkAcI6D.js.map
