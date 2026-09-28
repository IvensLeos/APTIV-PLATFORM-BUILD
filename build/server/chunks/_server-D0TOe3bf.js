import { c as connectDB } from './db-wxZFJtrv.js';
import { r as redirect } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/logout/+server.js
var POST = async ({ cookies, locals }) => {
	const session = cookies.get("session_id");
	if (session) {
		await (await connectDB()).collection("USERS").updateOne({ sessionToken: session }, { $set: { sessionToken: null } });
		cookies.delete("session_id", { path: "/" });
	}
	throw redirect(303, "/login");
};

export { POST };
//# sourceMappingURL=_server-D0TOe3bf.js.map
