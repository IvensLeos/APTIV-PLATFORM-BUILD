import { c as connectDB } from './db-W1d6-Une.js';
import { j as json } from './index-CRFfcpCQ.js';
import './private-C3tFArXN.js';
import 'mongodb';
import './index-DBqjc0Yf.js';

//#region src/routes/api/planning/upload/+server.js
var POST = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get("csv-file");
		const dateParam = formData.get("form-date");
		if (!file || file.size === 0) return json({
			success: false,
			error: "No se cargó ningún archivo CSV válido."
		}, { status: 400 });
		const rows = (await file.text()).split(/\r?\n/);
		const parsedPlans = [];
		for (let i = 1; i < rows.length; i++) {
			if (!rows[i].trim()) continue;
			const cols = rows[i].includes("	") ? rows[i].split("	") : rows[i].split(",");
			if (cols.length >= 4) {
				const modulePn = cols[0]?.trim();
				const planModule = parseInt(cols[1]?.trim(), 10) || 0;
				const planBracket = parseInt(cols[2]?.trim(), 10) || 0;
				const planTotal = parseInt(cols[3]?.trim(), 10) || 0;
				if (modulePn) parsedPlans.push({
					modulePn,
					planModule,
					planBracket,
					planTotal
				});
			}
		}
		await (await connectDB()).collection("PLANNING").updateOne({ key: `PLAN_${dateParam}` }, { $set: {
			key: `PLAN_${dateParam}`,
			value: parsedPlans,
			updatedAt: /* @__PURE__ */ new Date()
		} }, { upsert: true });
		return json({ success: true });
	} catch (err) {
		console.error("❌ Error parsing program master CSV in API:", err);
		return json({
			success: false,
			error: err.message
		}, { status: 500 });
	}
};

export { POST };
//# sourceMappingURL=_server-DywprgF4.js.map
