//#region src/routes/+layout.server.js
var load = async ({ locals }) => {
	return { user: locals.user || null };
};

var _layout_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-D92irIE6.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.SVPoyWkL.js","_app/immutable/chunks/Dtv3tcwd.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/FJ4qG_Bp.js","_app/immutable/chunks/bRKb9NaZ.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/ekNJv7IX.js","_app/immutable/chunks/oYli88qG.js"];
const stylesheets = ["_app/immutable/assets/0.ByV-Mzxx.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-cy53uumH.js.map
