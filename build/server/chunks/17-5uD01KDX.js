import { c as connectDB } from './db-W1d6-Une.js';
import { v as verifyPassword } from './auth-3Yrv9b3F.js';
import { f as fail, r as redirect } from './index-CRFfcpCQ.js';
import crypto from 'crypto';
import './private-C3tFArXN.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/login/+page.server.js
var actions = { default: async ({ request, cookies }) => {
	const data = await request.formData();
	const username = data.get("username")?.toUpperCase();
	const password = data.get("password");
	if (!username || !password) return fail(400, { error: "Missing credentials" });
	const db = await connectDB();
	const user = await db.collection("USERS").findOne({ username });
	if (!user || !verifyPassword(password, user.password)) return fail(401, { error: "Invalid username or password" });
	const sessionToken = crypto.randomUUID();
	await db.collection("USERS").updateOne({ username }, { $set: { sessionToken } });
	cookies.set("session_id", sessionToken, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: false,
		maxAge: 3600 * 24
	});
	throw redirect(303, "/");
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions
});

const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-Bk68lVfq.js')).default;
const server_id = "src/routes/login/+page.server.js";
const imports = ["_app/immutable/nodes/17.CUGYISst.js","_app/immutable/chunks/B8IyymNy.js","_app/immutable/chunks/C6KawVg1.js","_app/immutable/chunks/991LZ9Z8.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/BvAjruqt.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = ["_app/immutable/assets/17.C-AsVgLY.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=17-5uD01KDX.js.map
