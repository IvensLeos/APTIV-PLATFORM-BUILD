import { r as requireRole } from './access-CAyZvWwC.js';
import { c as connectDB } from './db-CJixkQQl.js';
import { B as BUILD_STREAMS } from './plantAreas-CXYWu3iK.js';
import { a as parseProductionPlanCsv, p as planKey, e as enrichProductionPlan } from './productionPlan2-MeMfny_0.js';
import { j as json } from './index-CRFfcpCQ.js';
import './shared-server-9-2j12mp.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/planning/upload/+server.js
var POST = async ({ request, locals }) => {
	requireRole(locals, ["ADMIN"]);
	try {
		const formData = await request.formData();
		const file = formData.get("csv-file");
		const dateParam = String(formData.get("form-date") || "").trim();
		const stream = String(formData.get("stream") || "").trim();
		if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return json({
			success: false,
			error: "The plan needs an operating day."
		}, { status: 400 });
		if (!file || file.size === 0) return json({
			success: false,
			error: "Upload a CSV file."
		}, { status: 400 });
		if (file.size > 1e6) return json({
			success: false,
			error: "The CSV is larger than 1 MB."
		}, { status: 400 });
		const parsed = parseProductionPlanCsv(await file.text());
		if (!parsed.length) return json({
			success: false,
			error: "No packing rows found. The file needs PACKING PARTNUMBER, MODULE, PLAN MODULE and PLAN BRACKET."
		}, { status: 400 });
		const db = await connectDB();
		const key = planKey(dateParam);
		const incoming = await enrichProductionPlan(db, parsed, stream);
		let value = incoming;
		if (BUILD_STREAMS[stream]) value = [...(await enrichProductionPlan(db, (await db.collection("PLANNING").findOne({ key }))?.value || [])).filter((row) => row.type && row.type !== stream), ...incoming];
		await db.collection("PLANNING").updateOne({ key }, { $set: {
			key,
			value,
			updatedAt: /* @__PURE__ */ new Date()
		} }, { upsert: true });
		return json({
			success: true,
			rows: incoming.length
		});
	} catch (err) {
		console.error("Production plan CSV failed:", err);
		return json({
			success: false,
			error: err.message
		}, { status: 500 });
	}
};

export { POST };
//# sourceMappingURL=_server-iO3ppGde.js.map
