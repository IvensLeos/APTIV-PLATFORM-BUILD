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
const component = async () => component_cache ??= (await import('./_layout.svelte-CfebZ0zu.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.xC4Q-nCl.js","_app/immutable/chunks/Xfe-JNtk.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/9H_ZnO9g.js","_app/immutable/chunks/R4tYv_H8.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/ekNJv7IX.js","_app/immutable/chunks/oYli88qG.js"];
const stylesheets = ["_app/immutable/assets/0.aKtm1oRi.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-D-bZoErD.js.map
