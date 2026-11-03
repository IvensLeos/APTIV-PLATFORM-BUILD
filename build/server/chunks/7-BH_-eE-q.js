import { r as requireRole } from './access-D6j5h6xx.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { b as revokeFailureRule, c as reopenLevelReview, e as acceptValidRule, f as confirmFailureRule, d as divertMatching, l as loadActiveRules, g as loadFailureReview } from './transitFailures-C8J3UDGQ.js';
import { f as fail } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './pieceLevel-C7Coi6am.js';
import './plantAreas-CXYWu3iK.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/failure-review/+page.server.js
var PART = /^[0-9]{8}$/;
function readPair(formData) {
	return {
		part: String(formData.get("part") || "").trim(),
		process: String(formData.get("process") || "").trim().toUpperCase()
	};
}
var load = async ({ locals }) => {
	requireRole(locals, ["SUPERVISOR", "ADMIN"]);
	const db = await connectDB();
	await divertMatching(db, await loadActiveRules(db));
	return await loadFailureReview(db);
};
var actions = {
	confirm: async ({ request, locals }) => {
		requireRole(locals, ["SUPERVISOR", "ADMIN"]);
		const formData = await request.formData();
		const { part, process } = readPair(formData);
		const error = String(formData.get("error") || "").trim();
		if (!PART.test(part) || !process || !error) return fail(400, { message: "Part, process, and an error note are required." });
		return {
			confirmed: true,
			part,
			process,
			moved: await confirmFailureRule(await connectDB(), {
				part,
				process,
				error
			})
		};
	},
	accept: async ({ request, locals }) => {
		requireRole(locals, ["SUPERVISOR", "ADMIN"]);
		const { part, process } = readPair(await request.formData());
		if (!PART.test(part) || !process) return fail(400, { message: "Part and process are required." });
		await acceptValidRule(await connectDB(), {
			part,
			process
		});
		return {
			accepted: true,
			part,
			process
		};
	},
	reopen: async ({ request, locals }) => {
		requireRole(locals, ["SUPERVISOR", "ADMIN"]);
		const { part, process } = readPair(await request.formData());
		if (!PART.test(part) || !process) return fail(400, { message: "Part and process are required." });
		await reopenLevelReview(await connectDB(), {
			part,
			process
		});
		return {
			reopened: true,
			part,
			process
		};
	},
	revoke: async ({ request, locals }) => {
		requireRole(locals, ["SUPERVISOR", "ADMIN"]);
		const { part, process } = readPair(await request.formData());
		if (!PART.test(part) || !process) return fail(400, { message: "Part and process are required." });
		return {
			revoked: true,
			part,
			process,
			moved: await revokeFailureRule(await connectDB(), {
				part,
				process
			})
		};
	}
};

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 7;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DRyC_lpu.js')).default;
const server_id = "src/routes/admin/failure-review/+page.server.js";
const imports = ["_app/immutable/nodes/7.CmCb29KY.js","_app/immutable/chunks/VrP0rh_H.js","_app/immutable/chunks/DDnqReJB.js","_app/immutable/chunks/B5mKRX16.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/_1AxgzS5.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=7-BH_-eE-q.js.map
