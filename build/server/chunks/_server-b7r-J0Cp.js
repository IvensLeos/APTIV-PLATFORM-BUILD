import { c as connectDB } from './db-CJixkQQl.js';
import { j as json } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/sync/+server.js
/** Latest cron scrape. Manual runs are ignored so the dashboard does not refresh for them. */
var GET = async () => {
	const db = await connectDB();
	if (!db) return json({ cronAt: null });
	const last = await db.collection("SCRAPE_LOGS").find({
		origin: { $ne: "MANUAL" },
		shift: { $not: { $regex: "_MANUAL$" } }
	}).sort({ timestamp: -1 }).limit(1).next();
	return json({ cronAt: last?.timestamp ? new Date(last.timestamp).toISOString() : null });
};

export { GET };
//# sourceMappingURL=_server-b7r-J0Cp.js.map
