import { l as logLine } from './log-Dpp269sc.js';
import { c as connectDB } from './db-BvaPBFyI.js';
import { e as ensureFinishProcesses, F as FINISH_ROUTE, a as FINISH_ROUTES } from './plantAreas-DImca8Fn.js';
import { l as loadActiveRules, r as ruleKey } from './transitFailures-CC90qmbV.js';
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
		console.error(logLine("layout", "ruta finish fallida", {
			collection: "PROCESSES",
			fallback: "FINISH_ROUTE"
		}), error);
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
const component = async () => component_cache ??= (await import('./_layout.svelte-C_ukQtsU.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.CObZWGWF.js","_app/immutable/chunks/Cjd6MTfx.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/B-09-nc1.js","_app/immutable/chunks/CrizfRWZ.js","_app/immutable/chunks/edX-DyEE.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/CNN20Oai.js","_app/immutable/chunks/DDnyBIma.js","_app/immutable/chunks/LlHMmW_j.js","_app/immutable/chunks/DJtW1GKF.js","_app/immutable/chunks/BdF4nNdE.js"];
const stylesheets = ["_app/immutable/assets/0.DBEoZ8nW.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-DPCKIhYw.js.map
