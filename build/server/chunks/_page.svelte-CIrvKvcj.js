import { o as onDestroy } from './index-server-CQ5DdqbI.js';
import { U as escape_html, a7 as ensure_array_like, T as attr_class, V as stringify, a6 as attr_style, S as attr, K as derived, a8 as bind_props } from './dev-CorMzolj.js';
import { g as goto } from './client-BqX70KrN.js';
import { p as page } from './state-BxXkravK.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'jspdf';
import 'jspdf-autotable';
import './internal-DFaZqXAN.js';
import './index-DBqjc0Yf.js';

//#region src/lib/components/OeeChart.svelte
function OeeChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart.register(annotationPlugin, ChartDataLabels);
		let { canvasRef = void 0, labels = [], dataValues = [], producedValues = [], title = "Efficiency Monitor", onSelect } = $$props;
		onDestroy(() => {});
		$$renderer.push(`<div class="w-full bg-white p-6 shadow-2xl border-t-4 border-[#1A1A1A] h-[360px] relative"><canvas></canvas></div>`);
		bind_props($$props, { canvasRef });
	});
}
//#endregion
//#region src/routes/dashboard/[process]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let effCanvas = void 0;
		const activeShift = derived(() => page.url.searchParams.get("shift") || "ALL");
		const activeMachine = derived(() => page.url.searchParams.get("machine") || "");
		function updateUrl(key, value) {
			const url = new URL(page.url);
			if (value === "ALL" || !value) url.searchParams.delete(key);
			else url.searchParams.set(key, value);
			goto(url.toString(), {
				});
		}
		const metrics = derived(() => {
			const mappedStats = data.stats.map((s) => {
				const eff = s.totalExpected > 0 ? Math.round(s.totalProduced / s.totalExpected * 100) : 0;
				return {
					...s,
					efficiency: eff
				};
			});
			mappedStats.sort((a, b) => a.efficiency - b.efficiency);
			const labels = mappedStats.map((s) => s.machine);
			const efficiency = mappedStats.map((s) => s.efficiency);
			return {
				labels,
				efficiency,
				produced: mappedStats.map((s) => s.totalProduced),
				avgEfficiency: efficiency.length > 0 ? Math.round(efficiency.reduce((a, b) => a + b, 0) / efficiency.length) : 0,
				sortedStats: mappedStats
			};
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-8 text-[#1A1A1A] select-none font-sans"><header class="mb-8 flex items-end justify-between border-b-4 border-[#1A1A1A] pb-6"><div><div><span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase">Aptiv Platform Insights</span> <h1 class="text-5xl font-black tracking-tighter text-[#1A1A1A] uppercase">${escape_html(data.processName)}</h1></div> <div class="mt-4 flex gap-2"><!--[-->`);
			const each_array = ensure_array_like([
				"ALL",
				"T09",
				"T25",
				"T08"
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let shift = each_array[$$index];
				$$renderer.push(`<button${attr_class(`border-2 px-4 py-1 text-[10px] font-black cursor-pointer transition-all duration-150 ${stringify(activeShift() === shift ? "border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xs" : "border-gray-200 bg-white text-gray-400 hover:border-[#FF4F00]")}`)}>${escape_html(shift)}</button>`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="flex flex-col items-end gap-1"><span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase italic">Efficiency ${escape_html(activeShift())}</span> <div${attr_class(`text-5xl font-black italic tracking-tighter leading-none ${stringify(metrics().avgEfficiency < 75 ? "text-red-600" : metrics().avgEfficiency < 85 ? "text-orange-500" : "text-green-600")}`)}>${escape_html(metrics().avgEfficiency)}%</div> <button class="mt-2 bg-[#1A1A1A] px-6 py-2 text-[10px] font-black text-white uppercase transition-all duration-150 cursor-pointer hover:bg-[#FF4F00] active:scale-98">Download Report</button></div></header> <div class="grid grid-cols-1 gap-8 xl:grid-cols-3"><div class="space-y-6 xl:col-span-2">`);
			OeeChart($$renderer, {
				labels: metrics().labels,
				dataValues: metrics().efficiency,
				producedValues: metrics().produced,
				title: `Station Efficiency % - ${stringify(activeShift())}`,
				onSelect: (m) => updateUrl("machine", m),
				get canvasRef() {
					return effCanvas;
				},
				set canvasRef($$value) {
					effCanvas = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> <div class="overflow-hidden border-t-4 border-[#1A1A1A] bg-white shadow-2xl"><table class="w-full border-collapse text-left table-fixed"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-[0.2em] text-white uppercase border-b border-gray-800"><th class="w-1/4 p-4 border-r border-white/10">Station Unit</th><th class="w-2/5 p-4 border-r border-white/10">Product Context (Families)</th><th class="p-4 border-r border-white/10 text-center">Throughput</th><th class="w-1/5 p-4 text-right">Performance</th></tr></thead><tbody class="divide-y divide-gray-100"><!--[-->`);
			const each_array_1 = ensure_array_like(metrics().sortedStats);
			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let m = each_array_1[i];
				const eff = m.efficiency;
				const delta = m.totalProduced - m.totalExpected;
				$$renderer.push(`<tr class="transition-colors duration-100 hover:bg-slate-50"><td class="p-4"><span class="block text-[11px] font-black text-[#1A1A1A] uppercase tracking-tight">${escape_html(m.machine)}</span> <div class="mt-1 flex flex-wrap gap-1"><!--[-->`);
				const each_array_2 = ensure_array_like(m.levels);
				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let lvl = each_array_2[$$index_1];
					$$renderer.push(`<span class="rounded-xs bg-gray-100 px-1.5 py-0.5 text-[7px] font-black text-gray-500 uppercase tracking-tighter border border-gray-200">${escape_html(lvl)}</span>`);
				}
				$$renderer.push(`<!--]--></div></td><td class="p-4 border-l border-gray-100"><div class="flex flex-wrap gap-1"><!--[-->`);
				const each_array_3 = ensure_array_like(m.families);
				for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
					let fam = each_array_3[$$index_2];
					$$renderer.push(`<button class="cursor-pointer rounded-xs border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700 uppercase italic transition-all duration-150 hover:bg-blue-600 hover:text-white">${escape_html(fam)}</button>`);
				}
				$$renderer.push(`<!--]--></div> <div class="mt-1.5 text-[8px] font-black text-gray-400 uppercase tracking-tight">${escape_html(m.parts.length)} Active PN's in Shift</div></td><td class="p-4 border-l border-gray-100 bg-slate-50/50 text-center font-mono"><div class="flex items-center justify-center gap-1.5"><span class="text-sm font-black text-blue-600 tabular-nums" title="Real Produced">${escape_html(m.totalProduced.toLocaleString())}</span> <span class="text-[10px] font-bold text-gray-300">/</span> <span class="text-xs font-bold text-gray-400 tabular-nums" title="Target / Expected">${escape_html(m.totalExpected.toLocaleString())}</span></div> <div class="mt-1 flex items-center justify-center gap-1">`);
				if (delta < 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded-xs border border-red-200">${escape_html(delta.toLocaleString())} PCS</span>`);
				} else if (delta > 0) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<span class="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-xs border border-green-200">+${escape_html(delta.toLocaleString())} PCS</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="text-[9px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-xs border border-gray-200">BALANCED</span>`);
				}
				$$renderer.push(`<!--]--></div></td><td class="p-4 text-right border-l border-gray-100"><div class="flex flex-col items-end justify-center"><span${attr_class(`text-xl leading-none font-black italic font-mono ${stringify(eff < 75 ? "text-red-600" : eff < 85 ? "text-orange-500" : "text-green-600")}`)}>${escape_html(eff)}%</span> <div class="mt-1.5 h-1 w-20 bg-gray-100 rounded-full overflow-hidden border border-gray-200/40"><div${attr_class(`h-full ${stringify(eff < 75 ? "bg-red-600" : eff < 85 ? "bg-orange-500" : "bg-green-600")}`)}${attr_style(`width: ${stringify(Math.min(eff, 100))}%`)}></div></div></div></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div></div> <div class="sticky top-6 border-t-8 border-[#FF4F00] bg-white p-6 shadow-2xl h-fit"><header class="mb-6 flex items-center justify-between"><div><span class="block text-[10px] font-black tracking-widest text-gray-400 uppercase">Downtime Analysis</span> <h3 class="text-xl leading-none font-black text-[#1A1A1A] uppercase italic mt-0.5 truncate max-w-[210px]">${escape_html(page.url.searchParams.get("family") ? `Family: ${page.url.searchParams.get("family")}` : activeMachine() || "All Stations")}</h3></div> `);
			if (page.url.searchParams.get("family") || activeMachine()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="text-[9px] font-black text-red-600 uppercase underline cursor-pointer hover:text-red-800">Clear Filters</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></header> <div class="space-y-4">`);
			const each_array_4 = ensure_array_like(data.pareto);
			if (each_array_4.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let fail = each_array_4[$$index_4];
					$$renderer.push(`<div class="flex flex-col gap-1.5"><div class="flex justify-between text-[10px] font-black uppercase tracking-tight"><span class="truncate pr-4 text-gray-700"${attr("title", fail.code)}>${escape_html(fail.code || "UNKNOWN BREAKDOWN")}</span> <span class="text-[#FF4F00] font-mono whitespace-nowrap">${escape_html(fail.minutes)} min</span></div> <div class="h-2 w-full bg-gray-100 rounded-sm overflow-hidden border border-gray-200/30"><div class="h-full bg-[#1A1A1A] transition-all duration-500"${attr_style(`width: ${stringify(fail.minutes / (data.pareto[0]?.minutes || 1) * 100)}%`)}></div></div></div>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<div class="text-center py-8 text-xs font-bold italic text-gray-400 uppercase tracking-wider">No downtime logged for this selection</div>`);
			}
			$$renderer.push(`<!--]--></div></div></div></div>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CIrvKvcj.js.map
