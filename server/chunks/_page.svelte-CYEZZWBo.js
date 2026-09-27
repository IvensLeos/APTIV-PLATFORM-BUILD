import { T as attr_class, V as stringify, U as escape_html, S as attr, a6 as ensure_array_like, a7 as attr_style, K as derived, a8 as bind_props } from './dev-BeB9xBTu.js';
import './client-BvSdefav.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'jspdf';
import 'jspdf-autotable';
import './index-server-D1jVuM2R.js';
import './internal-BsbvprU4.js';
import './index-DBqjc0Yf.js';

//#region src/lib/components/MainProductionChart.svelte
function MainProductionChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart.register(annotationPlugin, ChartDataLabels);
		let { trendData = [], filterHour = void 0, accentColor, isReadOnly, targetRate = 0 } = $$props;
		const productiveHours = derived(() => trendData.filter((t) => t.qty > 0));
		const realAverage = derived(() => productiveHours().length > 0 ? productiveHours().reduce((acc, curr) => acc + curr.qty, 0) / productiveHours().length : 0);
		const lastHourPerformance = derived(() => {
			if (productiveHours().length === 0) return null;
			const lastProductiveEntry = productiveHours()[productiveHours().length - 1];
			return {
				time: lastProductiveEntry.time,
				qty: lastProductiveEntry.qty,
				isAbove: lastProductiveEntry.qty >= realAverage()
			};
		});
		$$renderer.push(`<div class="relative w-full h-full">`);
		if (productiveHours().length > 0 && lastHourPerformance()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="absolute top-0 left-12 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1.5 rounded shadow-sm"><span class="text-[9px] font-black uppercase tracking-widest text-gray-400">vs Shift Average:</span> <div class="flex items-center gap-1"><span${attr_class(`text-[10px] font-black ${stringify(lastHourPerformance().isAbove ? "text-green-600" : "text-orange-500")}`)}>${escape_html(lastHourPerformance().isAbove ? "↑ ABOVE" : "↓ BELOW")}</span> <span class="text-[9px] font-mono text-gray-400">(${escape_html(Math.round(realAverage()))} PCS)</span></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <canvas></canvas></div>`);
		bind_props($$props, { filterHour });
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let filterType = "ALL";
		let filterProcess = "ALL";
		let filterHour = "ALL";
		let filterShift = "ALL";
		let filterFailure = "ALL";
		let filterFamily = "ALL";
		let lastUpdated = (/* @__PURE__ */ new Date()).toLocaleTimeString();
		const breadcrumb = derived(() => {
			const datePart = data.selectedDate;
			if (!data.isReadOnly && filterType === "ALL" && filterShift === "ALL" && filterProcess === "ALL" && filterHour === "ALL" && filterFailure === "ALL" && filterFamily === "ALL") return `${datePart} > PLANT DASHBOARD`;
			let path = [datePart, "PLANT" ];
			if (filterHour !== "ALL") path.push(filterHour);
			return path.join(" > ");
		});
		const activeData = derived(() => {
			let baseLogs = [...data.logs];
			if (filterHour !== "ALL") baseLogs = baseLogs.filter((l) => {
				return l.DISPLAY_ID.match(/(\d{1,2}):\d{2}:\d{2}\s*(AM|PM)/i)?.[0] === filterHour;
			});
			const unjustifiedLogs = baseLogs.filter((l) => l.TIME_LOST > 0 && !l.TIME_LOST_COMMENT);
			const unjustifiedMins = unjustifiedLogs.reduce((a, l) => a + l.TIME_LOST, 0);
			let filteredLogs = [...baseLogs];
			const totalProduced = filteredLogs.reduce((acc, l) => acc + (l.PRODUCED || 0), 0);
			const totalRate = filteredLogs.reduce((acc, l) => acc + (l.RATE || 0), 0);
			const hoursLogged = new Set(filteredLogs.map((l) => l.DISPLAY_ID.split(" ")[1]?.split(":")[0])).size || 1;
			const failureMap = {};
			const machineFailureMap = {};
			const famMap = {};
			baseLogs.forEach((l) => {
				const comment = l.TIME_LOST_COMMENT;
				if (l.TIME_LOST > 0) {
					if (Array.isArray(comment)) comment.forEach((f) => {
						if (f.code && f.minutes > 0) failureMap[f.code] = (failureMap[f.code] || 0) + Number(f.minutes);
					});
					else if (typeof comment === "string" && comment.trim() !== "") failureMap[comment] = (failureMap[comment] || 0) + l.TIME_LOST;
					machineFailureMap[`${l.PROCESS}-${l.MACHINE}`] = (machineFailureMap[`${l.PROCESS}-${l.MACHINE}`] || 0) + l.TIME_LOST;
				}
				famMap[l.FAMILY] = (famMap[l.FAMILY] || 0) + (l.PRODUCED || 0);
			});
			const trendLogs = baseLogs ;
			const hourlyMap = {};
			trendLogs.forEach((l) => {
				const tMatch = l.DISPLAY_ID.match(/(\d{1,2}):\d{2}:\d{2}\s*(AM|PM)/i);
				if (tMatch) {
					const label = tMatch[0];
					if (!hourlyMap[label]) hourlyMap[label] = {
						qty: 0,
						topFam: ""
					};
					hourlyMap[label].qty += l.PRODUCED;
				}
			});
			const trend = Object.entries(hourlyMap).map(([time, info]) => ({
				time,
				qty: info.qty
			})).sort((a, b) => {
				const to24 = (s) => {
					const h = parseInt(s.split(":")[0]);
					const isPM = s.includes("PM");
					let hr = h;
					if (isPM && h !== 12) hr += 12;
					if (!isPM && h === 12) hr = 0;
					return hr < 6 ? hr + 24 : hr;
				};
				return to24(a.time) - to24(b.time);
			});
			const streamMap = Object.entries(data.streams).map(([type, steps]) => ({
				type,
				steps: steps.map((s) => {
					const stepLogs = data.logs.filter((l) => l.PROCESS === s && l.TYPE === type && (filterShift === "ALL"));
					const d = stepLogs.reduce((acc, curr) => {
						acc.p += curr.PRODUCED;
						acc.r += curr.RATE;
						return acc;
					}, {
						p: 0,
						r: 0
					});
					return {
						name: s,
						efficiency: d.r > 0 ? Math.round(d.p / d.r * 100) : 0,
						hasPending: stepLogs.some((l) => l.TIME_LOST > 0 && !l.TIME_LOST_COMMENT)
					};
				})
			}));
			const procMap = {};
			filteredLogs.forEach((l) => {
				if (!procMap[l.PROCESS]) procMap[l.PROCESS] = {
					name: l.PROCESS,
					p: 0,
					r: 0,
					uMins: 0,
					machine: l.MACHINE
				};
				procMap[l.PROCESS].p += l.PRODUCED;
				procMap[l.PROCESS].r += l.RATE;
				if (l.TIME_LOST > 0 && !l.TIME_LOST_COMMENT) procMap[l.PROCESS].uMins += l.TIME_LOST;
			});
			return {
				totalProduced,
				globalEfficiency: totalRate > 0 ? Math.round(totalProduced / totalRate * 100) : 0,
				projectedFinal: Math.round(totalProduced + totalProduced / hoursLogged * Math.max(0, 24 - hoursLogged)),
				unjustifiedCount: unjustifiedLogs.length,
				unjustifiedMins,
				topFailures: Object.entries(failureMap).map(([name, mins]) => ({
					name,
					mins
				})).sort((a, b) => b.mins - a.mins).slice(0, 10),
				criticalMachines: Object.entries(machineFailureMap).map(([name, mins]) => ({
					name,
					mins
				})).sort((a, b) => b.mins - a.mins).slice(0, 10),
				totalRate,
				trend,
				topFamilies: Object.entries(famMap).map(([name, qty]) => ({
					name,
					qty
				})).sort((a, b) => b.qty - a.qty).slice(0, 15),
				stats: Object.values(procMap).filter((p) => filterType === "ALL").map((p) => ({
					name: p.name,
					machine: p.machine,
					efficiency: p.r > 0 ? Math.round(p.p / p.r * 100) : 0,
					unjustified: p.uMins
				})).sort((a, b) => a.efficiency - b.efficiency),
				streamMap
			};
		});
		const accentColor = derived(() => {
			return filterHour !== "ALL" || filterShift !== "ALL" || filterFailure !== "ALL" || filterFamily !== "ALL" ? "#0070f3" : "#FF4F00";
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="max-w-[1600px] mx-auto p-6 space-y-6 overflow-hidden bg-[#FBFBFB]"><header class="flex items-baseline justify-between border-b-2 border-black pb-4"><div class="flex items-center gap-4"><div${attr_class(`h-14 w-2 ${stringify(activeData().unjustifiedCount > 0 ? "bg-orange-500 animate-pulse" : accentColor())}`)}></div> <div><h1 class="text-4xl font-black uppercase tracking-tighter leading-none">${escape_html(breadcrumb())}</h1> <div class="flex items-center gap-3 mt-2"><span class="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Last Update: ${escape_html(lastUpdated)}</span> `);
			if (data.isReadOnly) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="text-[9px] font-black text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">🔒 Mode: Historical</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div></div> <div class="flex items-center gap-4"><button class="bg-[#B80000] text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-red-700 flex items-center gap-2 shadow-sm transition-all"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Export Report</button> <input type="date"${attr("value", data.selectedDate)} class="text-[10px] font-black border-2 border-black px-2 py-1 outline-none"/> <button${attr_class(`text-[10px] font-black px-3 py-1 border uppercase transition-colors ${stringify("bg-transparent border-transparent text-transparent pointer-events-none")}`)}>Reset</button> <div class="flex gap-1"><!--[-->`);
			const each_array = ensure_array_like([
				"ALL",
				"T09",
				"T25",
				"T08"
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let shift = each_array[$$index];
				$$renderer.push(`<button${attr_class(`px-3 py-1 text-[9px] font-black border-2 transition-all ${stringify(filterShift === shift ? "bg-black border-black text-white" : "bg-white border-gray-100 text-gray-400 hover:border-[#FF4F00]")}`)}>${escape_html(shift)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <div class="text-right border-l pl-6 min-w-[200px]"><span class="text-3xl font-mono font-black">${escape_html(activeData().totalProduced.toLocaleString())}</span> <div class="text-[10px] font-black text-gray-400 uppercase">Est. Final: <span class="text-[#FF4F00] italic">${escape_html(activeData().projectedFinal.toLocaleString())} PCS</span></div></div></div></header> <div class="grid grid-cols-1 gap-4"><!--[-->`);
			const each_array_1 = ensure_array_like(activeData().streamMap);
			for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
				let stream = each_array_1[$$index_2];
				$$renderer.push(`<div${attr_class(`bg-white border-2 p-5 cursor-pointer ${stringify(filterType === stream.type ? "border-[#FF4F00] shadow-lg" : "")}`)}><div class="flex justify-between items-center mb-4"><span${attr_class(`text-[11px] font-black uppercase ${stringify(filterType === stream.type ? "text-[#FF4F00]" : "")}`)}>${escape_html(stream.type)} Value Stream</span> <span class="text-[9px] font-bold text-gray-400 uppercase">${escape_html(data.familyMapping[stream.type].length)} Families</span></div> <div class="flex items-center overflow-x-hidden"><!--[-->`);
				const each_array_2 = ensure_array_like(stream.steps);
				for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
					let step = each_array_2[i];
					$$renderer.push(`<div class="flex-1 min-w-[100px] flex flex-col items-center relative"><span${attr_class(`text-[8px] uppercase mb-1 truncate w-full text-center ${stringify(step.efficiency > 0 ? "font-black text-[#1A1A1A]" : "font-medium text-gray-400")}`)}>${escape_html(step.name)}</span> <button${attr_class(`w-full h-8 border text-[11px] font-black transition-all relative ${stringify(step.efficiency === 0 ? "bg-[#2a2a2a] border-[#333] text-gray-500" : filterProcess === step.name && filterType === stream.type ? "outline outline-2 outline-[#0070f3] outline-offset-[-2px] bg-blue-50" : step.efficiency < 85 ? "bg-red-500 text-white border-red-700" : "bg-green-600 text-white border-green-800")}`)}>${escape_html(step.efficiency)}% `);
					if (step.hasPending) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-bl-sm animate-pulse"></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></button></div> `);
					if (i < stream.steps.length - 1) {
						$$renderer.push("<!--[0-->");
						const nStep = stream.steps[i + 1];
						$$renderer.push(`<div class="px-2 pt-4 self-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"${attr_class(`transition-colors ${stringify(nStep.efficiency > 0 && nStep.efficiency < 85 ? "text-red-500 animate-pulse" : step.efficiency > 0 ? "text-[#FF4F00]" : "text-gray-200")}`)}><path d="M9 18l6-6-6-6"></path></svg></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="grid grid-cols-1 lg:grid-cols-12 gap-6"><section class="lg:col-span-9 space-y-6"><div class="bg-white border p-6 h-[450px] shadow-sm relative"><h3 class="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest border-l-2 border-[#FF4F00] pl-2">Real-Time Production Trend</h3> `);
			MainProductionChart($$renderer, {
				trendData: activeData().trend,
				accentColor: accentColor(),
				isReadOnly: data.isReadOnly,
				targetRate: activeData().totalRate,
				get filterHour() {
					return filterHour;
				},
				set filterHour($$value) {
					filterHour = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----></div> <div class="bg-white border p-6 shadow-sm"><h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l-2 border-blue-600 pl-2 mb-6">Produced Families Heat-Grid</h3> <div class="grid grid-cols-2 md:grid-cols-5 gap-4"><!--[-->`);
			const each_array_3 = ensure_array_like(activeData().topFamilies);
			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let fam = each_array_3[i];
				$$renderer.push(`<div${attr_class(`bg-gray-50 p-3 border-t-4 cursor-pointer transition-all hover:scale-105 ${stringify(filterFamily === fam.name ? "border-[#0070f3] bg-blue-50" : "")}`)}><span${attr_class(`text-[10px] font-black uppercase block truncate ${stringify(filterFamily === fam.name ? "text-[#0070f3]" : "")}`)}>${escape_html(fam.name)}</span> <span class="text-xl font-mono font-black">${escape_html(fam.qty.toLocaleString())}</span> <div class="text-[8px] text-gray-400 font-bold uppercase mt-1">${escape_html((fam.qty / (activeData().totalProduced || 1) * 100).toFixed(1))}% Share</div></div>`);
			}
			$$renderer.push(`<!--]--></div></div></section> <aside class="lg:col-span-3 space-y-6"><h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Process Nav</h3> <div class="space-y-2 max-h-[300px] overflow-y-auto pr-2"><!--[-->`);
			const each_array_4 = ensure_array_like(activeData().stats);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let proc = each_array_4[$$index_4];
				$$renderer.push(`<div class="flex gap-1"><button${attr_class(`flex-1 bg-white border p-3 flex justify-between transition-all ${stringify(filterProcess === proc.name ? "border-[#0070f3] bg-blue-50" : "border-gray-100")}`)}><div class="text-left font-black uppercase text-[10px]">${escape_html(proc.name)} <span${attr_class(`block text-lg ${stringify(proc.efficiency < 85 ? "text-red-500" : "text-green-600")}`)}>${escape_html(proc.efficiency)}%</span></div></button> <a${attr("href", `/capture/${stringify(proc.name.toLowerCase().replace(/\s+/g, "-"))}/${stringify(proc.machine.toLowerCase())}?date=${stringify(data.selectedDate)}`)} target="_blank" class="bg-[#1A1A1A] text-white p-3 flex items-center justify-center hover:bg-[#FF4F00] transition-colors">${escape_html(data.isReadOnly ? "👁️" : "⚙️")}</a></div>`);
			}
			$$renderer.push(`<!--]--></div> <div class="bg-[#1A1A1A] p-4 shadow-xl border-t-4 border-red-600 space-y-6"><div><h3 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Loss Distribution</h3><div class="h-[180px]"><canvas></canvas></div></div> <div class="space-y-3"><!--[-->`);
			const each_array_5 = ensure_array_like(activeData().topFailures);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let fail = each_array_5[$$index_5];
				$$renderer.push(`<button class="w-full text-left"><div${attr_class(`flex justify-between text-[9px] font-bold ${stringify(filterFailure === fail.name ? "text-red-500" : "text-white")} uppercase mb-1`)}><span class="truncate w-32">${escape_html(fail.name)}</span><span>${escape_html(fail.mins)}m</span></div> <div class="w-full bg-gray-800 h-1"><div${attr_class(`h-full transition-all ${stringify(filterFailure === fail.name ? "bg-white" : "bg-red-600")}`)}${attr_style(`width: ${stringify(fail.mins / (activeData().topFailures[0]?.mins || 1) * 100)}%`)}></div></div></button>`);
			}
			$$renderer.push(`<!--]--></div></div></aside></div> `);
			if (filterHour !== "ALL" || filterFailure !== "ALL" || filterFamily !== "ALL") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="fixed bottom-6 right-6 bg-[#FF4F00] text-white px-6 py-3 font-black uppercase text-[10px] shadow-2xl animate-bounce z-50">Clear All Filters [X]</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <footer class="max-w-7xl mx-auto p-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System • Intelligent Plant Monitoring</footer>`);
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
//# sourceMappingURL=_page.svelte-CYEZZWBo.js.map
