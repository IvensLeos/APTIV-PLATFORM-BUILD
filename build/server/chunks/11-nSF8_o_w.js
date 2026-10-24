import { c as connectDB } from './db-CJixkQQl.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/admin/scrapelogs/+page.server.js
var RANGES = {
	"24h": 24,
	"48h": 48,
	"7d": 168
};
var load = async ({ url }) => {
	const serverFilter = url.searchParams.get("server") || "ALL";
	const range = RANGES[url.searchParams.get("range")] ? url.searchParams.get("range") : "48h";
	const hours = RANGES[range];
	const query = {};
	if (serverFilter !== "ALL") query.server = serverFilter.toUpperCase();
	query.timestamp = { $gte: /* @__PURE__ */ new Date(Date.now() - (hours + 8) * 36e5) };
	try {
		return {
			logs: (await (await connectDB()).collection("SCRAPE_LOGS").find(query).sort({ timestamp: -1 }).limit(hours > 48 ? 2500 : 900).toArray()).map((log) => ({
				id: log._id.toString(),
				timestamp: log.timestamp ? log.timestamp.toISOString() : null,
				server: log.server || "UNKNOWN",
				shift: log.shift || "N/A",
				origin: log.origin || (String(log.shift || "").endsWith("_MANUAL") ? "MANUAL" : "CRON"),
				status: log.status || "PENDING",
				message: log.message || "",
				records: Number(log.records) || 0,
				details: {
					upserted: Number(log.details?.upserted) || 0,
					modified: Number(log.details?.modified) || 0
				}
			})),
			currentFilter: serverFilter,
			range
		};
	} catch (error) {
		console.error("Error loading SCRAPE_LOGS:", error);
		return {
			logs: [],
			currentFilter: serverFilter,
			range,
			error: "Could not load the scrape history."
		};
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 11;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-bgDmS8Vp.js')).default;
const server_id = "src/routes/admin/scrapelogs/+page.server.js";
const imports = ["_app/immutable/nodes/11.Butfh9on.js","_app/immutable/chunks/DZ4n__KV.js","_app/immutable/chunks/BI8b8DQr.js","_app/immutable/chunks/CdUwCJJQ.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=11-nSF8_o_w.js.map
