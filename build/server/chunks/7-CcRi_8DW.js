import { c as connectDB } from './db-W1d6-Une.js';
import './private-C3tFArXN.js';
import 'mongodb';

//#region src/routes/admin/health/+page.server.js
/** @type {import('./$types').PageServerLoad} */
var load = async () => {
	try {
		const status = await (await connectDB()).admin().command({ serverStatus: 1 });
		const connections = status.connections || {};
		const mem = status.mem || {};
		const opcounters = status.opcounters || {};
		return { health: {
			status: "ONLINE",
			version: status.version,
			uptimeSeconds: status.uptime,
			pool: {
				current: connections.current || 0,
				available: connections.available || 0,
				totalCreated: connections.totalCreated || 0,
				active: connections.active || 0
			},
			memory: {
				resident: mem.resident || 0,
				virtual: mem.virtual || 0
			},
			ops: {
				insert: opcounters.insert || 0,
				query: opcounters.query || 0,
				update: opcounters.update || 0,
				delete: opcounters.delete || 0
			},
			pid: status.pid,
			host: status.host
		} };
	} catch (err) {
		console.error("❌ Error de infraestructura en panel de salud:", err);
		return { health: {
			status: "OFFLINE",
			error: err.message,
			pool: {
				current: 0,
				available: 0,
				totalCreated: 0,
				active: 0
			},
			memory: {
				resident: 0,
				virtual: 0
			},
			ops: {
				insert: 0,
				query: 0,
				update: 0,
				delete: 0
			},
			pid: "N/A",
			host: "DISCONNECTED"
		} };
	}
};
/** @type {import('./$types').Actions} */
var actions = { refresh: async () => {
	return { success: true };
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-YGH5hDuC.js')).default;
const server_id = "src/routes/admin/health/+page.server.js";
const imports = ["_app/immutable/nodes/7.D_cpLPWM.js","_app/immutable/chunks/DFUt-VCY.js","_app/immutable/chunks/jNgZYSrJ.js","_app/immutable/chunks/991LZ9Z8.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CD4BWWb1.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=7-CcRi_8DW.js.map
