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
const component = async () => component_cache ??= (await import('./_layout.svelte-CLu14EBK.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.DmAQBIml.js","_app/immutable/chunks/D3yo-TEn.js","_app/immutable/chunks/pNTMqyZV.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/wsXWVRrq.js","_app/immutable/chunks/DRnEbJyS.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = ["_app/immutable/assets/0.Czq9IlXY.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-gkagwu6i.js.map
