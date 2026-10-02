import { T as attr_class, V as stringify, S as attr, U as escape_html, a7 as ensure_array_like, K as derived } from './dev-CorMzolj.js';
import './client-7pnEKwh9.js';
import './index-server-CQ5DdqbI.js';
import './internal-FoTrLbld.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/export/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const MASTER_SCHEMAS = {
			OEES: [
				{
					id: "IDENTIFIER",
					name: "Identifier (Key)"
				},
				{
					id: "DATETIME",
					name: "Datetime Bruto"
				},
				{
					id: "DISPLAY_ID",
					name: "Display ID (ERP)"
				},
				{
					id: "DURATION",
					name: "Duration (Min)"
				},
				{
					id: "FAMILY",
					name: "Product Family"
				},
				{
					id: "LEVEL",
					name: "Taxonomy Level"
				},
				{
					id: "MACHINE",
					name: "Machine Name"
				},
				{
					id: "OEEDATE",
					name: "OEE Operational Date"
				},
				{
					id: "PARTNUMBER",
					name: "Part Number"
				},
				{
					id: "PROCESS",
					name: "Process Step"
				},
				{
					id: "PRODUCED",
					name: "Produced Count"
				},
				{
					id: "QUALITY_PASS",
					name: "Quality Pass"
				},
				{
					id: "QUALITY_FAIL",
					name: "Quality Fail"
				},
				{
					id: "QUALITY_YIELD",
					name: "Quality Yield %"
				},
				{
					id: "RATE",
					name: "Target Rate"
				},
				{
					id: "SERVER_PROCESS",
					name: "Server Operation"
				},
				{
					id: "SERVER_SOURCE",
					name: "Server Source"
				},
				{
					id: "STATION",
					name: "Station Code"
				},
				{
					id: "TIME_LOST",
					name: "Lost Minutes"
				},
				{
					id: "TIME_LOST_COMMENT",
					name: "Failure Code / Splits"
				},
				{
					id: "TYPE",
					name: "Product Type"
				},
				{
					id: "UPDATED_AT: Date",
					name: "Last Sync Timestamp"
				}
			],
			FAILURECODES: [{
				id: "FAILURECODE",
				name: "Failure Description"
			}],
			ITEMS: [
				{
					id: "PARTNUMBER",
					name: "Part Number"
				},
				{
					id: "FAMILY",
					name: "Product Family"
				},
				{
					id: "TYPE",
					name: "Product Type"
				},
				{
					id: "LEVEL",
					name: "Taxonomy Level"
				}
			],
			PART_CONVERSIONS: [
				{
					id: "SERVER_PROCESS",
					name: "Server Process"
				},
				{
					id: "SERVER_PARTNUMBER",
					name: "Server Part Number"
				},
				{
					id: "FAMILY",
					name: "Product Family"
				},
				{
					id: "REAL_PARTNUMBER",
					name: "Real Part Number"
				},
				{
					id: "SERVER_SOURCE",
					name: "Server Source"
				},
				{
					id: "UPDATED_AT",
					name: "Last Update"
				}
			],
			RATES: [
				{
					id: "PARTNUMBER",
					name: "Part Number"
				},
				{
					id: "MACHINE",
					name: "Machine Name"
				},
				{
					id: "RATE",
					name: "Theoretical Rate"
				}
			],
			STATIONS: [
				{
					id: "STATION",
					name: "Station Code"
				},
				{
					id: "MACHINE",
					name: "Machine Name"
				},
				{
					id: "PROCESS",
					name: "Process Group"
				}
			]
		};
		let selectedTable = "OEES";
		let fromDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let toDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let selectedFields = [];
		let isDownloading = false;
		const currentAvailableFields = derived(() => MASTER_SCHEMAS[selectedTable] || []);
		const isTransactional = derived(() => selectedTable === "OEES");
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-8 text-[#1A1A1A] font-sans select-none animate-fade-in"><header class="mb-8 border-b-4 border-[#1A1A1A] pb-6"><span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase block mb-1">Plant Data Governance &amp; Analytics</span> <h1 class="text-5xl font-black tracking-tighter text-[#1A1A1A] uppercase leading-none">Data Export Console</h1></header> <main class="grid grid-cols-1 lg:grid-cols-3 gap-8"><section class="bg-white border-2 border-[#1A1A1A] p-6 shadow-xl flex flex-col gap-6 h-fit"><h2 class="text-base font-black uppercase tracking-tight border-b border-gray-100 pb-2">⚙️ Target Parameters</h2> <div class="flex flex-col gap-1.5"><label for="table-select" class="text-[9px] font-black text-gray-400 uppercase tracking-wider">Select Database Table</label> `);
		$$renderer.select({
			id: "table-select",
			value: selectedTable,
			disabled: isDownloading,
			class: "w-full bg-gray-50 border-2 border-gray-200 text-xs font-bold px-3 py-2 rounded-none focus:outline-none focus:border-[#FF4F00] uppercase cursor-pointer"
		}, ($$renderer) => {
			$$renderer.option({ value: "OEES" }, ($$renderer) => {
				$$renderer.push(`Fact Table de Producción (OEES)`);
			});
			$$renderer.option({ value: "FAILURECODES" }, ($$renderer) => {
				$$renderer.push(`Catálogo de Motivos (FAILURECODES)`);
			});
			$$renderer.option({ value: "ITEMS" }, ($$renderer) => {
				$$renderer.push(`Taxonomía de Números de Parte (ITEMS)`);
			});
			$$renderer.option({ value: "PART_CONVERSIONS" }, ($$renderer) => {
				$$renderer.push(`Mapeo de Equivalencias (PART_CONVERSIONS)`);
			});
			$$renderer.option({ value: "RATES" }, ($$renderer) => {
				$$renderer.push(`Capacidades de Velocidad (RATES)`);
			});
			$$renderer.option({ value: "STATIONS" }, ($$renderer) => {
				$$renderer.push(`Identificadores de Estaciones (STATIONS)`);
			});
		});
		$$renderer.push(`</div> <div${attr_class(`grid grid-cols-2 gap-4 transition-all duration-200 ${stringify(isTransactional() ? "opacity-100" : "opacity-25 pointer-events-none select-none")}`)}><div class="flex flex-col gap-1.5"><label for="from-date" class="text-[9px] font-black text-gray-400 uppercase tracking-wider">Audit From</label> <input id="from-date" type="date"${attr("value", fromDate)} class="w-full border-2 border-gray-200 p-2 font-mono text-xs font-bold text-gray-800 outline-none focus:border-[#FF4F00] uppercase"/></div> <div class="flex flex-col gap-1.5"><label for="to-date" class="text-[9px] font-black text-gray-400 uppercase tracking-wider">Audit To</label> <input id="to-date" type="date"${attr("value", toDate)} class="w-full border-2 border-gray-200 p-2 font-mono text-xs font-bold text-gray-800 outline-none focus:border-[#FF4F00] uppercase"/></div></div> <button${attr("disabled", isDownloading, true)} class="w-full bg-[#1A1A1A] hover:bg-[#FF4F00] disabled:bg-gray-200 text-white font-black text-xs uppercase tracking-wider py-4 transition-all cursor-pointer shadow-md active:scale-99 disabled:cursor-not-allowed">${escape_html("📥 EXPORT SELECTED DATAPOOL")}</button></section> <section class="bg-white border-2 border-[#1A1A1A] p-6 shadow-xl lg:col-span-2 flex flex-col gap-4"><header class="flex justify-between items-center border-b border-gray-100 pb-2"><div><span class="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Column Filter Matrix</span> <h3 class="text-sm font-black text-[#1A1A1A] uppercase mt-0.5">Select Fields to Export</h3></div> <div class="flex gap-2"><button${attr("disabled", isDownloading, true)} class="text-[9px] font-black uppercase bg-gray-100 border border-gray-300 px-2 py-1 hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer">Select All</button> <button${attr("disabled", isDownloading, true)} class="text-[9px] font-black uppercase bg-gray-100 border border-gray-300 px-2 py-1 hover:bg-[#FF4F00] hover:text-white transition-all cursor-pointer">Clear All</button></div></header> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1 border border-gray-50 bg-slate-50/50"><!--[-->`);
		const each_array = ensure_array_like(currentAvailableFields());
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let field = each_array[i];
			$$renderer.push(`<label class="flex items-center gap-3 p-2.5 bg-white border border-gray-200 hover:border-gray-400 transition-all cursor-pointer select-none"><input type="checkbox"${attr("value", field.id)}${attr("checked", selectedFields.includes(field.id), true)}${attr("disabled", isDownloading, true)} class="w-4 h-4 accent-[#FF4F00] cursor-pointer"/> <div class="flex flex-col"><span class="text-[11px] font-black font-mono text-[#1A1A1A] leading-tight">${escape_html(field.id)}</span> <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tight">${escape_html(field.name)}</span></div></label>`);
		}
		$$renderer.push(`<!--]--></div></section></main></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Data Export Console</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DRfQN1ZL.js.map
