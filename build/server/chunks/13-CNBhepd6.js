import { r as requireRole, R as ROLES } from './access-DAZySCgG.js';
import { c as connectDB } from './db-BvaPBFyI.js';
import { h as hashPassword } from './auth-3Yrv9b3F.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import './log-Dpp269sc.js';
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
		if (!username || !password) return fail(400, {
			action: "register",
			error: "Employee ID and password are required"
		});
		if (!ROLES.includes(role)) return fail(400, {
			action: "register",
			error: `Invalid role. Allowed: ${ROLES.join(", ")}`
		});
		const db = await connectDB();
		if (await db.collection("USERS").findOne({ username })) return fail(400, {
			action: "register",
			error: "That employee ID already exists"
		});
		await db.collection("USERS").insertOne({
			username,
			name,
			role,
			password: hashPassword(password),
			sessionToken: null,
			createdAt: /* @__PURE__ */ new Date()
		});
		return {
			action: "register",
			success: true,
			username,
			role
		};
	},
	delete: async ({ request, locals }) => {
		requireRole(locals, ["ADMIN"]);
		const username = (await request.formData()).get("username")?.toString().trim().toUpperCase();
		if (!username) return fail(400, {
			action: "delete",
			error: "Employee ID is required"
		});
		if (username === locals.user.username) return fail(400, {
			action: "delete",
			error: "You cannot remove your own account"
		});
		await (await connectDB()).collection("USERS").deleteOne({ username });
		return {
			action: "delete",
			success: true,
			username
		};
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 13;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-G0ony_nJ.js')).default;
const server_id = "src/routes/admin/users/+page.server.js";
const imports = ["_app/immutable/nodes/13.B2MWGW-M.js","_app/immutable/chunks/B-09-nc1.js","_app/immutable/chunks/Cjd6MTfx.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CrizfRWZ.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=13-CNBhepd6.js.map
