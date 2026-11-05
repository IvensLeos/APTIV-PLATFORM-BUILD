import { s as safeAppPath } from './access-D6j5h6xx.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { v as verifyPassword } from './auth-3Yrv9b3F.js';
import { f as fail, r as redirect } from './index-CRFfcpCQ.js';
import crypto from 'crypto';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/login/+page.server.js
var actions = { default: async ({ request, cookies }) => {
	const data = await request.formData();
	const username = data.get("username")?.toString().toUpperCase();
	const password = data.get("password");
	const nextField = data.get("next");
	const next = safeAppPath(typeof nextField === "string" ? nextField : "");
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
	throw redirect(303, next || "/");
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions
});

const index = 17;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-8FfFzMF1.js')).default;
const server_id = "src/routes/login/+page.server.js";
const imports = ["_app/immutable/nodes/17.DD-fHmDr.js","_app/immutable/chunks/BkZFxZKk.js","_app/immutable/chunks/CN2WNdFs.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CIvzFELC.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = ["_app/immutable/assets/17.C-AsVgLY.css"];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=17-BC_3ri1c.js.map
