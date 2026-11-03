import { s as safeAppPath, p as publicPageFromReferer, a as authorize, l as loginOverlayPath } from './access-D6j5h6xx.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { b as broadcastManager } from './broadcast-Bef7xGyo.js';
import { i as initCron } from './cron-DPuDnM6R.js';
import { j as json } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './plantTime-CjpO2xUR.js';
import './transitFailures-C8J3UDGQ.js';
import './pieceLevel-C7Coi6am.js';
import './plantAreas-CXYWu3iK.js';
import './holidays-CLGlgZFg.js';
import 'cheerio';
import 'cheerio-tableparser';
import 'node-cron';
import 'node:fs/promises';
import 'node:path';
import './index-DBqjc0Yf.js';

//#region src/hooks.server.js
if (!global.cronInitialized) {
	initCron();
	global.cronInitialized = true;
	console.log("✅ Cron Engine: Inicializado (Instancia Única)");
}
broadcastManager.rehydrate().catch((err) => console.error("❌ Andon: fallo en la rehidratación inicial:", err));
var handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const session = event.cookies.get("session_id");
	if (session) try {
		const user = await (await connectDB()).collection("USERS").findOne({ sessionToken: session });
		if (user) {
			const { password, _id, ...safeUser } = user;
			event.locals.user = {
				...safeUser,
				id: _id.toString()
			};
		} else event.locals.user = null;
	} catch (error) {
		console.error("❌ Error de sesión en Hooks:", error);
		event.locals.user = null;
	}
	else event.locals.user = null;
	if (pathname === "/login" && event.request.method === "GET") {
		const next = safeAppPath(event.url.searchParams.get("next") || "");
		if (event.locals.user) return new Response(null, {
			status: 303,
			headers: { location: next || "/" }
		});
		const back = publicPageFromReferer(event.url.origin, event.request.headers.get("referer")) || "/";
		const dest = new URL(back, event.url.origin);
		dest.searchParams.set("login", "1");
		if (next) dest.searchParams.set("next", next);
		return new Response(null, {
			status: 303,
			headers: { location: `${dest.pathname}${dest.search}` }
		});
	}
	const decision = authorize(pathname, event.locals.user);
	const isApi = pathname.startsWith("/api/");
	if (decision === "LOGIN") {
		if (isApi) return json({
			success: false,
			error: "Authentication required"
		}, { status: 401 });
		return new Response(null, {
			status: 303,
			headers: { location: loginOverlayPath(event.url.origin, event.request.headers.get("referer"), `${pathname}${event.url.search}`) }
		});
	}
	if (decision === "FORBIDDEN") {
		if (isApi) return json({
			success: false,
			error: "Insufficient permissions"
		}, { status: 403 });
		return new Response("403 Forbidden: Insufficient permissions", {
			status: 403,
			headers: { "Content-Type": "text/plain; charset=utf-8" }
		});
	}
	return await resolve(event);
};

export { handle };
//# sourceMappingURL=hooks.server-yBaEudhF.js.map
