import { c as connectDB } from './db-wxZFJtrv.js';
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
var SPI_S2_VARIANTS = [
	"AOI_PTH",
	"XRAY",
	"ICT"
];
var POST = async ({ request }) => {
	try {
		const { targetDateStr, mode = "SPI" } = await request.json();
		if (!targetDateStr) return json({
			success: false,
			error: "Fecha de control requerida"
		}, { status: 400 });
		const isBoardLabel = mode === "BOARD_LABEL";
		const optionsQuery = isBoardLabel ? "-group+process+partnumber+BOARD_LOTCODE+productfamily" : "-group+process+partnumber+MODEL+productfamily";
		const processList = isBoardLabel ? "BOARD_LABEL" : "SPI_S1,SPI_S2";
		const [y, m, d] = targetDateStr.split("-").map(Number);
		const dateRef = new Date(Date.UTC(y, m - 1, d));
		const dateStart = new Date(dateRef);
		dateStart.setUTCDate(dateStart.getUTCDate() - 2);
		const formatToERPDate = (dateObj) => {
			return `${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}/${String(dateObj.getUTCDate()).padStart(2, "0")}/${String(dateObj.getUTCFullYear()).substring(2)}`;
		};
		const strFrom = formatToERPDate(dateStart);
		const strTo = formatToERPDate(dateRef);
		const db = await connectDB();
		const serverLogs = [];
		for (const srv of SERVERS) {
			const targetUrl = `https://${srv.host}/std_public/wipreports?report=X_MANTIS&options=${optionsQuery}&processSList=${processList}&from=${strFrom}&to=${strTo}&maxevents=500000000&mode=1`;
			try {
				const response = await fetch(targetUrl);
				if (!response.ok) {
					serverLogs.push({
						server: srv.id,
						msg: `❌ HTTP Error ${response.status}`,
						type: "error",
						count: 0
					});
					continue;
				}
				const cleanedHtml = (await response.text()).replace(/&nbsp;/g, "").replace(/&nbsp/g, "");
				const $ = cheerio.load(cleanedHtml);
				cheerioTableparser($);
				const tableData = $("table").eq(1).parsetable(false, true, true);
				if (!tableData || tableData.length < 4) {
					serverLogs.push({
						server: srv.id,
						msg: `⚠️ Estructura inválida en 2da tabla`,
						type: "warning",
						count: 0
					});
					continue;
				}
				const uniqueOperationsMap = /* @__PURE__ */ new Map();
				let lastProcess = "";
				const totalRows = tableData[0].length;
				for (let i = 1; i < totalRows; i++) {
					const currentProcess = tableData[0]?.[i]?.trim() || "";
					const partNumber = tableData[1]?.[i]?.trim() || "";
					const rawModelOrLot = tableData[2]?.[i]?.trim() || "";
					const productFamily = tableData[3]?.[i]?.trim() || "";
					if (!currentProcess && !partNumber && !rawModelOrLot && !productFamily) continue;
					lastProcess = currentProcess !== "" ? currentProcess : lastProcess;
					if (!partNumber || !lastProcess) continue;
					const cleanPartNumber = partNumber.trim();
					const cleanProcess = lastProcess.trim();
					const cleanFamily = productFamily ? productFamily.trim() : "N/A";
					let cleanModel = "UNCODED_MODEL";
					if (rawModelOrLot) {
						const baseStr = rawModelOrLot.trim();
						cleanModel = isBoardLabel ? baseStr.substring(0, 8) : baseStr;
					}
					const baseKey = `${cleanPartNumber}_${cleanProcess}`;
					uniqueOperationsMap.set(baseKey, {
						SERVER_PARTNUMBER: cleanPartNumber,
						SERVER_PROCESS: cleanProcess,
						REAL_PARTNUMBER: cleanModel,
						FAMILY: cleanFamily
					});
					if (!isBoardLabel && cleanProcess === "SPI_S2") SPI_S2_VARIANTS.forEach((variantProcess) => {
						const variantKey = `${cleanPartNumber}_${variantProcess}`;
						uniqueOperationsMap.set(variantKey, {
							SERVER_PARTNUMBER: cleanPartNumber,
							SERVER_PROCESS: variantProcess,
							REAL_PARTNUMBER: cleanModel,
							FAMILY: cleanFamily
						});
					});
				}
				const conversionsOperations = Array.from(uniqueOperationsMap.values()).map((record) => ({ updateOne: {
					filter: {
						SERVER_PARTNUMBER: record.SERVER_PARTNUMBER,
						SERVER_PROCESS: record.SERVER_PROCESS
					},
					update: { $set: {
						...record,
						SERVER_SOURCE: srv.id,
						UPDATED_AT: /* @__PURE__ */ new Date()
					} },
					upsert: true
				} }));
				if (conversionsOperations.length > 0) {
					const result = await db.collection("PART_CONVERSIONS2").bulkWrite(conversionsOperations, { ordered: false });
					const affected = result.upsertedCount + result.modifiedCount;
					serverLogs.push({
						server: srv.id,
						msg: `✅ Sincronización exitosa [Modo: ${mode}]`,
						type: "success",
						count: affected
					});
				} else serverLogs.push({
					server: srv.id,
					msg: `📋 Sin registros válidos encontrados`,
					type: "warning",
					count: 0
				});
			} catch (srvErr) {
				serverLogs.push({
					server: srv.id,
					msg: `❌ Fallo de red: ${srvErr.message}`,
					type: "error",
					count: 0
				});
			}
		}
		return json({
			success: true,
			mode,
			range: {
				from: strFrom,
				to: strTo
			},
			nextDateStr: dateStart.toISOString().split("T")[0],
			logs: serverLogs
		});
	} catch (error) {
		console.error("❌ Error Custom Scraper API:", error);
		return json({
			success: false,
			error: error.message
		}, { status: 500 });
	}
};

export { POST };
//# sourceMappingURL=_server-Bh-LtaOq.js.map
