import { c as connectDB } from './db-CJixkQQl.js';
import { e as ensureFinishProcesses, F as FINISH_ROUTE, a as FINISH_ROUTES } from './plantAreas-qHlizC1w.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';

//#region src/routes/+layout.server.js
var load = async ({ locals }) => {
	let finishRoute = [...FINISH_ROUTE];
	let finishRoutes = FINISH_ROUTES;
	try {
		const db = await connectDB();
		if (db) {
			const loaded = await ensureFinishProcesses(db);
			finishRoute = loaded.names;
			finishRoutes = loaded.routes;
		}
	} catch (error) {
		console.error("Could not load finish processes", error);
	}
	return {
		user: locals.user || null,
		finishRoute,
		finishRoutes
	};
};

var _layout_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-CB_UqhpI.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.CRD10K2f.js","_app/immutable/chunks/CQlOUdPR.js","_app/immutable/chunks/CU36ghjL.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/Yz7ydEA-.js","_app/immutable/chunks/DQxhgtqC.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/ekNJv7IX.js","_app/immutable/chunks/C6AkmZ6G.js","_app/immutable/chunks/BOHdJPtS.js"];
const stylesheets = ["_app/immutable/assets/0.CoeqOJz5.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-Ct5gsbZO.js.map
