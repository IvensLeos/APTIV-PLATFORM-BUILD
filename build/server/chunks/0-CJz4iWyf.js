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
const component = async () => component_cache ??= (await import('./_layout.svelte-ChbHaxJh.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.C6h0R1ax.js","_app/immutable/chunks/YSkIBHS_.js","_app/immutable/chunks/991LZ9Z8.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/DK6yFgsL.js","_app/immutable/chunks/Dut0QryM.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/oYli88qG.js"];
const stylesheets = ["_app/immutable/assets/0.fb4PWHgW.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-CJz4iWyf.js.map
