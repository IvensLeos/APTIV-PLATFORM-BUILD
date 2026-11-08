import { s as safeAppPath, p as publicPageFromReferer, a as authorize, l as loginOverlayPath } from './access-DAZySCgG.js';
import { l as logLine } from './log-Dpp269sc.js';
import { c as connectDB } from './db-BvaPBFyI.js';
import { b as broadcastManager } from './broadcast-BxLMKe3z.js';
import { i as initCron } from './cron-DruH2l3a.js';
import { j as json } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './shifts-BYGd7DZC.js';
import './plantTime-C6hdc3to.js';
import './holidays-CLGlgZFg.js';
import './transitFailures-CC90qmbV.js';
import './pieceLevel-B94ZE9fG.js';
import './plantAreas-DImca8Fn.js';
import 'cheerio';
import 'cheerio-tableparser';
import 'node:fs/promises';
import 'node:path';
import 'node-cron';
import './index-DBqjc0Yf.js';

//#region src/hooks.server.js
if (!global.cronInitialized) {
	initCron();
	global.cronInitialized = true;
	console.log(logLine("hooks", "arranque", {
		cron: "una-vez",
		andon: "ANDON_ACTIVE",
		tz: "America/Matamoros"
	}));
}
broadcastManager.rehydrate();
var handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	if (pathname === "/capture" || pathname.startsWith("/capture/")) {
		const tail = pathname.slice(8);
		return new Response(null, {
			status: 301,
			headers: { location: `${tail ? `/review${tail}` : "/"}${event.url.search}` }
		});
	}
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
		console.error(logLine("hooks", "sesion fallida", {
			collection: "USERS",
			path: pathname
		}), error);
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
//# sourceMappingURL=hooks.server-Btu8ZHJN.js.map
