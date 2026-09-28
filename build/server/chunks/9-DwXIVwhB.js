import { c as connectDB } from './db-W1d6-Une.js';
import './private-C3tFArXN.js';
import 'mongodb';

//#region src/routes/admin/planning/+page.server.js
var load = async ({ url }) => {
	const dateParam = url.searchParams.get("date");
	let selectedDateUTC;
	if (dateParam) {
		const [y, m, d] = dateParam.split("-").map(Number);
		selectedDateUTC = new Date(Date.UTC(y, m - 1, d));
	} else {
		const now = /* @__PURE__ */ new Date();
		if (now.getHours() * 60 + now.getMinutes() < 400) now.setDate(now.getDate() - 1);
		selectedDateUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
	}
	try {
		const db = await connectDB();
		const productionAggregation = await db.collection("OEES").aggregate([{ $match: { OEEDATE: selectedDateUTC } }, { $group: {
			_id: {
				part: "$PARTNUMBER",
				process: "$PROCESS"
			},
			totalProduced: { $sum: "$PRODUCED" }
		} }]).toArray();
		const liveProductionMap = new Map(productionAggregation.map((p) => {
			return [`${p._id.part ? String(p._id.part).trim() : ""}|${p._id.process ? String(p._id.process).trim() : ""}`, p.totalProduced];
		}));
		const itemsCatalog = await db.collection("ITEMS").find({}).project({
			PARTNUMBER: 1,
			FAMILY: 1
		}).toArray();
		const itemsMap = new Map(itemsCatalog.map((i) => [i.PARTNUMBER.trim(), i]));
		const conversionsRaw = await db.collection("PART_CONVERSIONS").find({ SERVER_PROCESS: { $in: ["SPI_S2", "SPI_S1"] } }).project({
			SERVER_PARTNUMBER: 1,
			SERVER_PROCESS: 1,
			REAL_PARTNUMBER: 1
		}).toArray();
		const spiS2Map = /* @__PURE__ */ new Map();
		const spiS1Map = /* @__PURE__ */ new Map();
		conversionsRaw.forEach((c) => {
			if (c.SERVER_PROCESS === "SPI_S2" && c.SERVER_PARTNUMBER) spiS2Map.set(c.SERVER_PARTNUMBER.trim(), c.REAL_PARTNUMBER?.trim());
			if (c.SERVER_PROCESS === "SPI_S1" && c.SERVER_PARTNUMBER) spiS1Map.set(c.SERVER_PARTNUMBER.trim(), c.REAL_PARTNUMBER?.trim());
		});
		const savedPlan = await db.collection("PLANNING").findOne({ key: `PLAN_${selectedDateUTC.toISOString().split("T")[0]}` });
		let matrix = [];
		if (savedPlan && Array.isArray(savedPlan.value)) matrix = buildTrackingMatrix(savedPlan.value, itemsMap, liveProductionMap, spiS2Map, spiS1Map, selectedDateUTC);
		return {
			selectedDate: selectedDateUTC.toISOString().split("T")[0],
			matrix
		};
	} catch (error) {
		console.error("❌ Error en load de planning:", error);
		return {
			selectedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			matrix: []
		};
	}
};
/**
* Motor del Value Stream Tracker con la lógica core restaurada y meta en LEAKTEST
*/
function buildTrackingMatrix(rawPlans, itemsMap, productionMap, spiS2Map, spiS1Map, selectedDateUTC) {
	const days = [
		"DOMINGO",
		"LUNES",
		"MARTES",
		"MIÉRCOLES",
		"JUEVES",
		"VIERNES",
		"SÁBADO"
	];
	const dayGroupLabel = `${days[selectedDateUTC.getUTCDay()]} - ${days[(selectedDateUTC.getUTCDay() + 1) % 7]}`;
	return rawPlans.map((plan) => {
		const realModulePart = plan.modulePn.trim();
		const cleanServerPn = spiS2Map.get(realModulePart) || spiS1Map.get(realModulePart) || "NO MODULE LINK";
		const itemDoc = itemsMap.get(realModulePart);
		const family = itemDoc ? itemDoc.FAMILY : "UNKNOWN FAMILY";
		const smtQty = cleanServerPn !== "NO MODULE LINK" ? productionMap.get(`${cleanServerPn}|SMT`) || 0 : 0;
		const progQty = productionMap.get(`${realModulePart}|PROGRAMMING`) || 0;
		const edgebondQty = productionMap.get(`${realModulePart}|EDGEBOND`) || 0;
		const routerQty = productionMap.get(`${realModulePart}|ROUTERMILLING`) || 0;
		const leaktestQty = productionMap.get(`${realModulePart}|LEAKTEST`) || 0;
		const eolQty = productionMap.get(`${realModulePart}|EOL`) || 0;
		const delta = leaktestQty - plan.planTotal;
		const attPercentage = plan.planTotal > 0 ? Math.round(leaktestQty / plan.planTotal * 100) : 0;
		return {
			day: dayGroupLabel,
			family,
			smtPart: cleanServerPn,
			modulePn: realModulePart,
			planModule: plan.planModule,
			planBracket: plan.planBracket,
			planTotal: plan.planTotal,
			wip: 0,
			smt: smtQty,
			programming: progQty,
			edgebond: edgebondQty,
			router: routerQty,
			leaktest: leaktestQty,
			eol: eolQty,
			wipFt: 0,
			delta,
			att: attPercentage,
			comments: attPercentage >= 100 ? "OK / WIP FT" : "BEHIND SCHEDULE"
		};
	});
}

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 9;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-PYPb5w6N.js')).default;
const server_id = "src/routes/admin/planning/+page.server.js";
const imports = ["_app/immutable/nodes/9.C7XcCaud.js","_app/immutable/chunks/BxJXZzbm.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CbAQeaAr.js","_app/immutable/chunks/BiFcycju.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=9-DwXIVwhB.js.map
