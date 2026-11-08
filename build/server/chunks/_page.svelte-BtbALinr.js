import { W as onDestroy } from './internal-BRbcW4zN.js';
import { a4 as escape_html, a7 as ensure_array_like, a2 as attr, a5 as attr_class, a6 as clsx$1, a3 as stringify, a8 as attr_style, X as derived, a9 as bind_props } from './dev-yuvcodp0.js';
import { g as goto } from './client-KlLoW8e0.js';
import { p as page } from './state-DY1Y5-Wn.js';
import { r as reviewHref } from './capturePath-IwOmvXDD.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'jspdf';
import 'jspdf-autotable';
import './index-DBqjc0Yf.js';

//#region src/lib/components/OeeChart.svelte
function OeeChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart.register(annotationPlugin, ChartDataLabels);
		let { canvasRef = void 0, labels = [], dataValues = [], producedValues = [], expectedValues = [], lostValues = [], selected = "", title = "Efficiency", onSelect } = $$props;
		onDestroy(() => {
		});
		$$renderer.push(`<div class="relative h-[320px] w-full border-t-4 border-[#1A1A1A] bg-white p-6 shadow-2xl">`);
		if (labels.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex h-full items-center justify-center text-[11px] font-black tracking-widest text-gray-400 uppercase">No production for this selection</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<canvas class="h-full w-full"></canvas>`);
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { canvasRef });
	});
}
//#endregion
//#region src/routes/dashboard/[process]/+page.svelte
function kpi($$renderer, label, value, detail, tone = "text-[#1A1A1A]") {
	$$renderer.push(`<div class="border-t-4 border-[#1A1A1A] bg-white px-4 py-3"><span class="block text-[9px] font-black tracking-widest text-gray-400 uppercase">${escape_html(label)}</span> <span${attr_class(`mt-1 block font-mono text-2xl leading-none font-black ${stringify(tone)}`)}>${escape_html(value)}</span> `);
	if (detail) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<span class="mt-1 block text-[8px] font-bold tracking-wide text-gray-400 uppercase">${escape_html(detail)}</span>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div>`);
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let effCanvas = void 0;
		const activeShift = derived(() => page.url.searchParams.get("shift") || "ALL");
		const activeMachine = derived(() => page.url.searchParams.get("machine") || "");
		const activeFamily = derived(() => page.url.searchParams.get("family") || "");
		const activeType = derived(() => page.url.searchParams.get("type") || "");
		const metrics = derived(() => {
			const sortedStats = data.stats.map((station) => {
				const expected = station.totalExpected || 0;
				return {
					...station,
					efficiency: expected > 0 ? Math.round(station.totalProduced / expected * 100) : 0
				};
			});
			sortedStats.sort((a, b) => a.efficiency - b.efficiency || a.machine.localeCompare(b.machine));
			const producedTotal = sortedStats.reduce((sum, station) => sum + station.totalProduced, 0);
			const expectedTotal = sortedStats.reduce((sum, station) => sum + station.totalExpected, 0);
			const uncodedMinutes = sortedStats.reduce((sum, station) => sum + station.uncodedMinutes, 0);
			const codedMinutes = sortedStats.reduce((sum, station) => sum + station.codedMinutes, 0);
			const programmedTotal = sortedStats.reduce((sum, station) => sum + station.programmedMinutes, 0);
			return {
				labels: sortedStats.map((station) => station.machine),
				efficiency: sortedStats.map((station) => station.efficiency),
				produced: sortedStats.map((station) => station.totalProduced),
				expected: sortedStats.map((station) => station.totalExpected),
				lost: sortedStats.map((station) => station.totalLostTime),
				avgEfficiency: expectedTotal > 0 ? Math.round(producedTotal / expectedTotal * 100) : 0,
				sortedStats,
				producedTotal,
				expectedTotal,
				gap: Math.round(producedTotal - expectedTotal),
				uncodedMinutes,
				codedMinutes,
				programmedMinutes: programmedTotal
			};
		});
		const hasUncoded = derived(() => metrics().uncodedMinutes > 0 || data.pareto.some((row) => row.code === "Uncoded loss"));
		const filtersOn = derived(() => Boolean(activeFamily() || activeMachine() || activeType()));
		function updateUrl(key, value) {
			const url = new URL(page.url);
			const current = url.searchParams.get(key) || "";
			if (!value || value === "ALL" || current === value) url.searchParams.delete(key);
			else url.searchParams.set(key, value);
			goto(`${url.pathname}${url.search}`, {
				});
		}
		function stationHref(machine) {
			const base = reviewHref(data.processName, machine, data.selectedDate);
			return data.area === "FINISH" ? `${base}&area=finish` : base;
		}
		function effText(value) {
			if (value < 75) return "text-red-600";
			if (value < 85) return "text-orange-500";
			return "text-green-600";
		}
		function effBar(value) {
			if (value < 75) return "bg-red-600";
			if (value < 85) return "bg-orange-500";
			return "bg-green-600";
		}
		function pcs(value) {
			return Math.round(Number(value) || 0).toLocaleString("en-US");
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-6 font-sans text-[#1A1A1A] select-none xl:p-8"><header class="mb-6 flex flex-wrap items-end justify-between gap-6 border-b-4 border-[#1A1A1A] pb-6"><div><span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase">${escape_html(data.area)} · ${escape_html(data.selectedDate)}</span> <h1 class="text-5xl font-black tracking-tighter uppercase">${escape_html(data.processName)}</h1> <div class="mt-4 flex gap-2"><!--[-->`);
			const each_array = ensure_array_like([
				"ALL",
				"T09",
				"T25",
				"T08"
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let shift = each_array[$$index];
				$$renderer.push(`<button type="button"${attr("aria-pressed", activeShift() === shift)}${attr_class(clsx$1(["cursor-pointer border-2 px-4 py-1 text-[10px] font-black transition-colors", activeShift() === shift ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-gray-200 bg-white text-gray-400 hover:border-[#FF4F00]"]))}>${escape_html(shift)}</button>`);
			}
			$$renderer.push(`<!--]--></div></div> <div class="flex flex-col items-end gap-1"><span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase">Process efficiency ${escape_html(activeShift())}</span> <div${attr_class(`font-mono text-5xl leading-none font-black italic ${stringify(effText(metrics().avgEfficiency))}`)}>${escape_html(metrics().avgEfficiency)}%</div> <span class="text-[8px] font-bold tracking-wide text-gray-400 uppercase">Produced / target. Programmed time is out.</span> <button type="button" class="mt-2 cursor-pointer bg-[#1A1A1A] px-6 py-2 text-[10px] font-black text-white uppercase hover:bg-[#FF4F00]">Download report</button></div></header> <section class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">`);
			kpi($$renderer, "Produced", pcs(metrics().producedTotal), `${metrics().sortedStats.length} stations`);
			$$renderer.push(`<!----> `);
			kpi($$renderer, "Target", pcs(metrics().expectedTotal), "After programmed time");
			$$renderer.push(`<!----> `);
			kpi($$renderer, "Gap", `${metrics().gap > 0 ? "+" : ""}${pcs(metrics().gap)}`, "Pieces vs target", metrics().gap < 0 ? "text-red-600" : "text-green-600");
			$$renderer.push(`<!----> `);
			kpi($$renderer, "Unplanned", `${Math.round(metrics().uncodedMinutes + metrics().codedMinutes).toLocaleString("en-US")}m`, `${Math.round(metrics().uncodedMinutes).toLocaleString("en-US")}m uncoded · ${Math.round(metrics().codedMinutes).toLocaleString("en-US")}m coded`, metrics().uncodedMinutes + metrics().codedMinutes > 0 ? "text-[#FF4F00]" : "text-[#1A1A1A]");
			$$renderer.push(`<!----> `);
			kpi($$renderer, "Programmed", `${Math.round(metrics().programmedMinutes)}m`, "Out of efficiency", "text-sky-700");
			$$renderer.push(`<!----></section> `);
			if (data.streams.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<section class="mb-6"><div class="mb-2 flex items-center justify-between"><h2 class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Valuestreams, worst first</h2> `);
				if (filtersOn()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button type="button" class="cursor-pointer text-[9px] font-black text-red-600 uppercase underline">Clear filters</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"><!--[-->`);
				const each_array_1 = ensure_array_like(data.streams);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let stream = each_array_1[$$index_1];
					$$renderer.push(`<button type="button"${attr("aria-pressed", activeType() === stream.type)}${attr_class(clsx$1(["cursor-pointer border-2 bg-white p-3 text-left", activeType() === stream.type ? "border-[#1A1A1A]" : "border-transparent hover:border-[#FF4F00]"]))}><span class="block truncate text-[10px] font-black tracking-wide uppercase">${escape_html(stream.type)}</span> <span${attr_class(`mt-1 block font-mono text-2xl leading-none font-black italic ${stringify(effText(stream.efficiency))}`)}>${escape_html(stream.efficiency)}%</span> <span class="mt-2 block font-mono text-[10px] font-bold text-gray-500">${escape_html(pcs(stream.totalProduced))} / ${escape_html(pcs(stream.totalExpected))}</span> <span class="mt-1 block text-[8px] font-bold tracking-wide text-gray-400 uppercase">${escape_html(stream.machineCount)} ${escape_html(stream.machineCount === 1 ? "station" : "stations")} · ${escape_html(Math.round(stream.unplannedMinutes).toLocaleString("en-US"))}m unplanned</span></button>`);
				}
				$$renderer.push(`<!--]--></div></section>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="grid grid-cols-1 gap-8 xl:grid-cols-3"><div class="space-y-6 xl:col-span-2">`);
			OeeChart($$renderer, {
				labels: metrics().labels,
				dataValues: metrics().efficiency,
				producedValues: metrics().produced,
				expectedValues: metrics().expected,
				lostValues: metrics().lost,
				selected: activeMachine(),
				title: `Station efficiency % — ${stringify(activeShift())}`,
				onSelect: (machine) => updateUrl("machine", machine),
				get canvasRef() {
					return effCanvas;
				},
				set canvasRef($$value) {
					effCanvas = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> <div class="overflow-hidden border-t-4 border-[#1A1A1A] bg-white shadow-2xl"><table class="w-full table-fixed border-collapse text-left"><thead><tr class="border-b border-gray-800 bg-[#1A1A1A] text-[9px] font-black tracking-[0.2em] text-white uppercase"><th class="w-[22%] border-r border-white/10 p-4">Station</th><th class="w-[38%] border-r border-white/10 p-4">Families</th><th class="border-r border-white/10 p-4 text-center">Throughput</th><th class="w-[18%] p-4 text-right">Performance</th></tr></thead><tbody class="divide-y divide-gray-100">`);
			const each_array_2 = ensure_array_like(metrics().sortedStats);
			if (each_array_2.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_4 = 0, $$length = each_array_2.length; $$index_4 < $$length; $$index_4++) {
					let station = each_array_2[$$index_4];
					const delta = Math.round(station.totalProduced - station.totalExpected);
					$$renderer.push(`<tr${attr_class(clsx$1(activeMachine() === station.machine ? "bg-orange-50" : "hover:bg-slate-50"))}><td class="p-4"><a${attr("href", stationHref(station.machine))} class="block text-[11px] font-black tracking-tight uppercase hover:text-[#FF4F00]">${escape_html(station.machine)}</a> <div class="mt-1 flex flex-wrap gap-1"><!--[-->`);
					const each_array_3 = ensure_array_like(station.levels);
					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let level = each_array_3[$$index_2];
						$$renderer.push(`<span class="rounded-xs border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[7px] font-black tracking-tighter text-gray-500 uppercase">${escape_html(level)}</span>`);
					}
					$$renderer.push(`<!--]--></div></td><td class="border-l border-gray-100 p-4"><div class="flex flex-wrap gap-1"><!--[-->`);
					const each_array_4 = ensure_array_like(station.families);
					for (let $$index_3 = 0, $$length = each_array_4.length; $$index_3 < $$length; $$index_3++) {
						let family = each_array_4[$$index_3];
						$$renderer.push(`<button type="button"${attr("aria-pressed", activeFamily() === family)}${attr_class(clsx$1(["cursor-pointer rounded-xs border px-2 py-0.5 text-[9px] font-black uppercase", activeFamily() === family ? "border-[#1A1A1A] bg-[#1A1A1A] text-white" : "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"]))}>${escape_html(family)}</button>`);
					}
					$$renderer.push(`<!--]--></div> <div class="mt-1.5 text-[8px] font-black tracking-tight text-gray-400 uppercase">${escape_html(station.parts.length)} part ${escape_html(station.parts.length === 1 ? "number" : "numbers")}</div></td><td class="border-l border-gray-100 bg-slate-50/50 p-4 text-center font-mono"><div class="flex items-center justify-center gap-1.5"><span class="text-sm font-black text-blue-600 tabular-nums">${escape_html(pcs(station.totalProduced))}</span> <span class="text-[10px] font-bold text-gray-300">/</span> <span class="text-xs font-bold text-gray-400 tabular-nums" title="Target after programmed downtime">${escape_html(pcs(station.totalExpected))}</span></div> <div class="mt-1">`);
					if (delta < 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="rounded-xs border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-600">${escape_html(delta.toLocaleString("en-US"))} pcs</span>`);
					} else if (delta > 0) {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<span class="rounded-xs border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-black text-green-600">+${escape_html(delta.toLocaleString("en-US"))} pcs</span>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span class="rounded-xs border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[9px] font-black text-gray-400">Balanced</span>`);
					}
					$$renderer.push(`<!--]--></div> `);
					if (station.uncodedMinutes > 0 || station.codedMinutes > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="mt-1 text-[8px] font-black tracking-wide text-[#FF4F00] uppercase">${escape_html(Math.round(station.uncodedMinutes))}m uncoded · ${escape_html(Math.round(station.codedMinutes))}m coded</div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (station.programmedMinutes > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="mt-1 text-[8px] font-black tracking-wide text-sky-700 uppercase">${escape_html(Math.round(station.programmedMinutes))}m programmed out</div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></td><td class="border-l border-gray-100 p-4 text-right"><span${attr_class(`font-mono text-xl leading-none font-black italic ${stringify(effText(station.efficiency))}`)}>${escape_html(station.efficiency)}%</span> <div class="mt-1.5 ml-auto h-1.5 w-full max-w-24 overflow-hidden rounded-full border border-gray-200/40 bg-gray-100"><div${attr_class(`h-full ${stringify(effBar(station.efficiency))}`)}${attr_style(`width: ${stringify(Math.min(station.efficiency, 100))}%`)}></div></div></td></tr>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<tr><td colspan="4" class="p-8 text-center text-[11px] font-black tracking-widest text-gray-400 uppercase">No production for this selection</td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div></div> <aside class="sticky top-6 h-fit border-t-8 border-[#FF4F00] bg-white p-6 shadow-2xl"><header class="mb-6 flex items-start justify-between gap-3"><div><span class="block text-[10px] font-black tracking-widest text-gray-400 uppercase">Downtime</span> <h3 class="mt-0.5 text-xl leading-none font-black uppercase italic">${escape_html(activeFamily() || activeMachine() || activeType() || "All stations")}</h3></div> `);
			if (filtersOn()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button type="button" class="cursor-pointer text-[9px] font-black text-red-600 uppercase underline">Clear filters</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></header> <div class="space-y-4">`);
			const each_array_5 = ensure_array_like(data.pareto);
			if (each_array_5.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let fail = each_array_5[$$index_5];
					$$renderer.push(`<div class="flex flex-col gap-1.5"><div class="flex justify-between text-[10px] font-black tracking-tight uppercase"><span class="truncate pr-4 text-gray-700"${attr("title", fail.code)}>${escape_html(fail.code)}</span> <span class="font-mono whitespace-nowrap text-[#FF4F00]">${escape_html(fail.minutes.toLocaleString("en-US"))} min</span></div> <div class="h-2 w-full overflow-hidden rounded-sm border border-gray-200/30 bg-gray-100"><div${attr_class(`h-full ${stringify(fail.code === "Uncoded loss" ? "bg-[#FF4F00]" : "bg-[#1A1A1A]")}`)}${attr_style(`width: ${stringify(fail.minutes / (data.pareto[0]?.minutes || 1) * 100)}%`)}></div></div></div>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<p class="py-8 text-center text-xs font-bold tracking-wider text-gray-400 uppercase italic">No unplanned downtime for this selection</p>`);
			}
			$$renderer.push(`<!--]--> `);
			if (hasUncoded()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="text-[8px] font-bold tracking-wide text-gray-400 uppercase">Uncoded minutes still count against efficiency. Open the station to assign a code.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="border-t border-gray-100 pt-3"><div class="flex items-baseline justify-between"><span class="text-[9px] font-black tracking-widest text-sky-700 uppercase">Programmed</span> <span class="font-mono text-sm font-black text-sky-700">${escape_html(Math.round(data.programmedMinutes || 0))}m</span></div> <p class="mt-1 text-[8px] font-bold tracking-wide text-gray-400 uppercase">Out of efficiency and this list</p></div></div></aside></div></div>`);
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
//# sourceMappingURL=_page.svelte-BtbALinr.js.map
