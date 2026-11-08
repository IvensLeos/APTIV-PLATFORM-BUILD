import { u as usesFixtureHistory } from './fixtures-BiAalZTH.js';
import 'cheerio';
import 'node:fs/promises';
import 'node:path';

//#region src/routes/admin/scrap-tickets/+page.server.js
async function load() {
	const fixtureMode = usesFixtureHistory();
	return {
		fixtureMode,
		samples: []
	};
}

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 10;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CBv8pyf3.js')).default;
const server_id = "src/routes/admin/scrap-tickets/+page.server.js";
const imports = ["_app/immutable/nodes/10.BDhNVzNW.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/C8Qz27k1.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = ["_app/immutable/assets/10.DJWqgjc9.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=10-IwO4G3Po.js.map
