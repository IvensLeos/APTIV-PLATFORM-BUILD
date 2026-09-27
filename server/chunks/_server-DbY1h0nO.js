import { c as connectDB } from './db-W1d6-Une.js';
import { j as json } from './index-CRFfcpCQ.js';
import './private-C3tFArXN.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/stats/+server.js
var GET = async () => {
	const db = await connectDB();
	return json({
		logs: await db.collection("SCRAPE_LOGS").find({}).sort({ timestamp: -1 }).limit(20).toArray(),
		serverStatus: await Promise.all([
			"REMAN65",
			"REDBC001",
			"REMAN61A"
		].map(async (name) => {
			const lastLog = await db.collection("SCRAPE_LOGS").findOne({ server: name }, { sort: { timestamp: -1 } });
			const lastProd = await db.collection("OEES").findOne({ SERVER_SOURCE: name }, { sort: { DATETIME: -1 } });
			return {
				name,
				status: lastLog?.status || "UNKNOWN",
				lastSync: lastLog?.timestamp,
				lastProduction: lastProd?.DATETIME,
				records: lastLog?.records || 0
			};
		}))
	});
};

export { GET };
//# sourceMappingURL=_server-DbY1h0nO.js.map
