import { r as requireRole, R as ROLES } from './access-DhuzMuXb.js';
import { c as connectDB } from './db-W1d6-Une.js';
import { h as hashPassword } from './auth-3Yrv9b3F.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './private-C3tFArXN.js';
import 'mongodb';
import 'crypto';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/users/+page.server.js
var load = async ({ locals }) => {
	requireRole(locals, ["ADMIN"]);
	const users = await (await connectDB()).collection("USERS").find({}, { projection: {
		password: 0,
		sessionToken: 0
	} }).toArray();
	return { users: JSON.parse(JSON.stringify(users)) };
};
var actions = {
	register: async ({ request, locals }) => {
		requireRole(locals, ["ADMIN"]);
		const data = await request.formData();
		const username = data.get("username")?.toString().trim().toUpperCase();
		const name = data.get("name")?.toString().trim() || "";
		const role = data.get("role")?.toString().toUpperCase();
		const password = data.get("password")?.toString();
		if (!username || !password) return fail(400, { error: "Campos obligatorios faltantes" });
		if (!ROLES.includes(role)) return fail(400, { error: `Rol inválido. Permitidos: ${ROLES.join(", ")}` });
		const db = await connectDB();
		if (await db.collection("USERS").findOne({ username })) return fail(400, { error: "El ID de empleado ya existe" });
		await db.collection("USERS").insertOne({
			username,
			name,
			role,
			password: hashPassword(password),
			sessionToken: null,
			createdAt: /* @__PURE__ */ new Date()
		});
		return { success: true };
	},
	delete: async ({ request, locals }) => {
		requireRole(locals, ["ADMIN"]);
		const username = (await request.formData()).get("username")?.toString().trim().toUpperCase();
		if (!username) return fail(400, { error: "Username requerido" });
		if (username === locals.user.username) return fail(400, { error: "Cannot delete your own account" });
		await (await connectDB()).collection("USERS").deleteOne({ username });
		return { success: true };
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-qzGEv2OP.js')).default;
const server_id = "src/routes/admin/users/+page.server.js";
const imports = ["_app/immutable/nodes/13.DMm64Llo.js","_app/immutable/chunks/BG4r87VM.js","_app/immutable/chunks/D3yo-TEn.js","_app/immutable/chunks/pNTMqyZV.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/wsXWVRrq.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=13-C2_D5sL-.js.map
