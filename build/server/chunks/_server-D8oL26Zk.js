import { p as publicPageFromReferer } from './access-DAZySCgG.js';
import { c as connectDB } from './db-BvaPBFyI.js';
import { r as redirect } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import './log-Dpp269sc.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/logout/+server.js
var POST = async ({ cookies, request, url }) => {
	const session = cookies.get("session_id");
	if (session) {
		await (await connectDB()).collection("USERS").updateOne({ sessionToken: session }, { $set: { sessionToken: null } });
		cookies.delete("session_id", { path: "/" });
	}
	throw redirect(303, publicPageFromReferer(url.origin, request.headers.get("referer")) || "/");
};

export { POST };
//# sourceMappingURL=_server-D8oL26Zk.js.map
