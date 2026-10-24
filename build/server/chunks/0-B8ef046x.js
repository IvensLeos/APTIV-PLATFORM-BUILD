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
const component = async () => component_cache ??= (await import('./_layout.svelte-BvR-tV1x.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.Di4kryHv.js","_app/immutable/chunks/BI8b8DQr.js","_app/immutable/chunks/CdUwCJJQ.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/16QF5fYH.js","_app/immutable/chunks/DZ4n__KV.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/ekNJv7IX.js","_app/immutable/chunks/BOHdJPtS.js"];
const stylesheets = ["_app/immutable/assets/0.DQjJpf0h.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-B8ef046x.js.map
