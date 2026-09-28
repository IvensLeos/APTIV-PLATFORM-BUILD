import { c as connectDB } from './db-wxZFJtrv.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/api/export/csv/+server.js
var EXPORTABLE_COLLECTIONS = [
	"OEES",
	"FAILURECODES",
	"ITEMS",
	"PART_CONVERSIONS",
	"RATES",
	"STATIONS"
];
var GET = async ({ url }) => {
	const collectionName = url.searchParams.get("collection");
	const fieldsParam = url.searchParams.get("fields");
	const fromDate = url.searchParams.get("from");
	const toDate = url.searchParams.get("to");
	if (!collectionName || !fieldsParam) return new Response("Parámetros de colección y campos obligatorios.", { status: 400 });
	if (!EXPORTABLE_COLLECTIONS.includes(collectionName)) return new Response(`Colección no exportable. Permitidas: ${EXPORTABLE_COLLECTIONS.join(", ")}`, { status: 400 });
	const targetHeaders = fieldsParam.split(",").map((f) => f.trim()).filter(Boolean);
	try {
		const db = await connectDB();
		const query = {};
		if (collectionName === "OEES" && fromDate && toDate) {
			const start = new Date(Date.UTC(...fromDate.split("-").map((n, i) => i === 1 ? n - 1 : Number(n))));
			const end = new Date(Date.UTC(...toDate.split("-").map((n, i) => i === 1 ? n - 1 : Number(n))));
			end.setUTCDate(end.getUTCDate() + 1);
			query.OEEDATE = {
				$gte: start,
				$lt: end
			};
		}
		const records = await db.collection(collectionName).find(query).toArray();
		if (records.length === 0) return new Response("No se encontraron registros para la consulta seleccionada.", { status: 404 });
		let csvContent = targetHeaders.join(",") + "\n";
		records.forEach((doc) => {
			const row = targetHeaders.map((header) => {
				let value;
				if (header === "TIME_LOST_COMMENT") {
					const cellComment = doc.TIME_LOST_COMMENT;
					if (!cellComment) value = "";
					else if (Array.isArray(cellComment)) value = cellComment.filter((f) => f.code && f.minutes > 0).map((f) => `${f.minutes}' ${f.code.trim()}`).join(", ");
					else value = doc.TIME_LOST > 0 ? `${doc.TIME_LOST}' ${String(cellComment).trim()}` : String(cellComment).trim();
				} else if (header.startsWith("QUALITY_")) {
					const subKey = header.replace("QUALITY_", "").toLowerCase();
					value = doc.QUALITY ? doc.QUALITY[subKey] : "";
				} else value = doc[header];
				if (value === void 0 || value === null) return "";
				if (value instanceof Date) return value.toISOString();
				if (typeof value === "object") value = JSON.stringify(value);
				let stringValue = String(value).replace(/"/g, "\"\"");
				if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes("\"")) stringValue = `"${stringValue}"`;
				return stringValue;
			});
			csvContent += row.join(",") + "\n";
		});
		return new Response(csvContent, { headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename=CUSTOMEXPORT_${collectionName}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`,
			"Cache-Control": "no-cache"
		} });
	} catch (error) {
		console.error("❌ Error en API Custom Export CSV:", error);
		return new Response(`Error interno del servidor: ${error.message}`, { status: 500 });
	}
};

export { GET };
//# sourceMappingURL=_server-yT17K_2D.js.map
