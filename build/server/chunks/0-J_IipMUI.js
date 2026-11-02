import { c as connectDB } from './db-CJixkQQl.js';
import { e as ensureFinishProcesses, F as FINISH_ROUTE, a as FINISH_ROUTES } from './plantAreas-CXYWu3iK.js';
import { l as loadActiveRules, r as ruleKey } from './transitFailures-C8J3UDGQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './pieceLevel-C7Coi6am.js';

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
const component = async () => component_cache ??= (await import('./_layout.svelte-DSAXkmfI.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.B2NRwN2c.js","_app/immutable/chunks/rXxnW_-v.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CGvQFN8u.js","_app/immutable/chunks/BIWZrWsJ.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/ekNJv7IX.js","_app/immutable/chunks/C6AkmZ6G.js","_app/immutable/chunks/BOHdJPtS.js"];
const stylesheets = ["_app/immutable/assets/0.BeF4HZSM.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-J_IipMUI.js.map
