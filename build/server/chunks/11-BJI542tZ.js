import { c as connectDB } from './db-W1d6-Une.js';
import './private-C3tFArXN.js';
import 'mongodb';

//#region src/routes/admin/scrapelogs/+page.server.js
var load = async ({ url }) => {
	const serverFilter = url.searchParams.get("server") || "ALL";
	const query = {};
	if (serverFilter !== "ALL") query.server = serverFilter.toUpperCase();
	try {
		return {
			logs: (await (await connectDB()).collection("SCRAPE_LOGS").find(query).sort({ timestamp: -1 }).limit(100).toArray()).map((log) => ({
				id: log._id.toString(),
				timestamp: log.timestamp ? log.timestamp.toISOString() : null,
				server: log.server || "UNKNOWN",
				shift: log.shift || "N/A",
				status: log.status || "PENDING",
				message: log.message || "",
				records: Number(log.records) || 0,
				details: log.details ? {
					upserted: Number(log.details.upserted) || 0,
					modified: Number(log.details.modified) || 0
				} : {
					upserted: 0,
					modified: 0
				}
			})),
			currentFilter: serverFilter
		};
	} catch (error) {
		console.error("❌ Error cargando el historial SCRAPE_LOGS:", error);
		return {
			logs: [],
			currentFilter: serverFilter,
			error: "Fallo al conectar con la base de datos de auditoría."
		};
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DBPABOl-.js')).default;
const server_id = "src/routes/admin/scrapelogs/+page.server.js";
const imports = ["_app/immutable/nodes/11.DiEZnIo8.js","_app/immutable/chunks/R4tYv_H8.js","_app/immutable/chunks/Xfe-JNtk.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=11-BJI542tZ.js.map
