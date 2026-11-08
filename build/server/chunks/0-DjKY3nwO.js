import { c as connectDB } from './db-CJixkQQl.js';
import { e as ensureFinishProcesses, F as FINISH_ROUTE, a as FINISH_ROUTES } from './plantAreas-DImca8Fn.js';
import { l as loadActiveRules, r as ruleKey } from './transitFailures-CW0DmRZ4.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './pieceLevel-B94ZE9fG.js';

//#region src/routes/+layout.server.js
var load = async ({ locals }) => {
	let finishRoute = [...FINISH_ROUTE];
	let finishRoutes = FINISH_ROUTES;
	let acceptedLevels = [];
	try {
		const db = await connectDB();
		if (db) {
			const loaded = await ensureFinishProcesses(db);
			finishRoute = loaded.names;
			finishRoutes = loaded.routes;
			acceptedLevels = (await loadActiveRules(db)).filter((rule) => rule.VERDICT === "VALID").map((rule) => ruleKey(rule.PARTNUMBER, rule.PROCESS));
		}
	} catch (error) {
		console.error("Could not load finish processes", error);
	}
	return {
		user: locals.user || null,
		finishRoute,
		finishRoutes,
		acceptedLevels
	};
};

var _layout_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-B9piVGVt.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.CsDL1G7i.js","_app/immutable/chunks/kHyVhEKm.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/BKqWofio.js","_app/immutable/chunks/q_NZEQ27.js","_app/immutable/chunks/gLrsi093.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/CNN20Oai.js","_app/immutable/chunks/LlHMmW_j.js","_app/immutable/chunks/DJtW1GKF.js","_app/immutable/chunks/BdF4nNdE.js"];
const stylesheets = ["_app/immutable/assets/0.__8LSXIO.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-DjKY3nwO.js.map
