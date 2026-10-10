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
const component = async () => component_cache ??= (await import('./_layout.svelte-D3iG2fBd.js')).default;
const server_id = "src/routes/+layout.server.js";
const imports = ["_app/immutable/nodes/0.5gKpFDnu.js","_app/immutable/chunks/1sVCy6Mt.js","_app/immutable/chunks/CdUwCJJQ.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/BMtfTTpJ.js","_app/immutable/chunks/BldcKQFE.js","_app/immutable/chunks/S-KyrcF8.js","_app/immutable/chunks/ekNJv7IX.js","_app/immutable/chunks/oYli88qG.js"];
const stylesheets = ["_app/immutable/assets/0.BEPTI98b.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server as server, server_id, stylesheets };
//# sourceMappingURL=0-BeD_M0zS.js.map
