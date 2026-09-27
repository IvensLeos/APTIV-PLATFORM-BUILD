import { U as escape_html, T as attr_class, V as stringify, S as attr, a7 as ensure_array_like, K as derived } from './dev-CorMzolj.js';
import { c as captureHref } from './capturePath-R_tTjP2G.js';

//#region src/routes/capture/[process]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const processName = derived(() => data.processName || "");
		const selectedDate = derived(() => data.selectedDate || "");
		const rawStations = derived(() => data.machines || []);
		let searchTerm = "";
		const filteredStations = derived(() => rawStations().filter((s) => s.name.toUpperCase().includes(searchTerm.toUpperCase())));
		const processStats = derived(() => {
			const total = rawStations().length;
			const withGaps = rawStations().filter((s) => s.hasGaps).length;
			return {
				withGaps,
				totalGaps: rawStations().reduce((acc, s) => acc + (s.pendingCount || 0), 0),
				healthPercentage: total > 0 ? Math.round((total - withGaps) / total * 100) : 100
			};
		});
		$$renderer.push(`<div class="max-w-7xl mx-auto p-4 bg-[#FBFBFB] min-h-screen font-sans"><header class="flex flex-col lg:flex-row lg:items-end justify-between border-b-4 border-[#1A1A1A] pb-6 mb-8 gap-4"><div><span class="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.3em] block mb-1">Production Gateway</span> <h1 class="text-5xl font-black uppercase tracking-tighter text-[#1A1A1A] leading-none">${escape_html(processName())}</h1></div> <div class="flex flex-wrap items-center gap-4 bg-[#1A1A1A] text-white px-6 py-3 shadow-xl border-b-4 border-[#FF4F00]"><div class="flex flex-col border-r border-slate-700 pr-4"><span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Target Date</span> <span class="text-xs font-mono font-black text-sky-400">${escape_html(selectedDate())}</span></div> <div class="flex flex-col border-r border-slate-700 pr-4"><span class="text-[8px] font-bold uppercase text-gray-400 tracking-wider">Process Health</span> <span${attr_class(`text-xs font-mono font-black ${stringify(processStats().healthPercentage < 85 ? "text-amber-400" : "text-emerald-400")}`)}>${escape_html(processStats().healthPercentage)}% Clean</span></div> <div class="flex flex-col"><span class="text-[8px] font-bold uppercase text-gray-400 tracking-wider">Total Gaps</span> <span class="text-xs font-mono font-black text-rose-400 text-center">${escape_html(processStats().totalGaps)}</span></div></div></header> <section class="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 border-2 border-slate-200 rounded-sm shadow-xs"><div class="w-full sm:w-72 relative"><input type="text"${attr("value", searchTerm)} placeholder="🔍 FILTER STATION..." class="w-full bg-slate-50 border border-slate-300 p-2 text-[10px] font-black uppercase outline-none focus:border-[#1A1A1A] focus:bg-white transition-colors"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="text-[9px] font-black uppercase text-slate-500 tracking-wider whitespace-nowrap">Showing ${escape_html(filteredStations().length)} of ${escape_html(rawStations().length)} Stations `);
		if (processStats().withGaps > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="text-amber-600 ml-1">(${escape_html(processStats().withGaps)} Require Attention)</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></section> `);
		if (filteredStations().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-white border-2 border-[#1A1A1A] border-l-8 border-[#FF4F00] p-5 text-[#1A1A1A] text-xs font-black uppercase tracking-widest shadow-md">⚠️ No stations match your current criteria on ${escape_html(processName())}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"><!--[-->`);
		const each_array = ensure_array_like(filteredStations());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let machine = each_array[$$index];
			$$renderer.push(`<a${attr("href", captureHref(processName(), machine.name, selectedDate()))}${attr_class(`group relative bg-white border-2 p-5 transition-all hover:shadow-2xl active:scale-95 flex flex-col justify-between min-h-[160px] ${stringify(machine.hasGaps ? "border-amber-500 bg-amber-500/5" : "border-gray-200 hover:border-[#1A1A1A]")}`)}><div class="flex justify-between items-start gap-2"><div class="flex flex-col min-w-0"><span${attr_class(`text-sm font-black uppercase tracking-tight truncate ${stringify(machine.hasGaps ? "text-amber-600" : "text-[#1A1A1A]")}`)}>${escape_html(machine.name)}</span> <span class="text-[8px] font-mono font-bold text-gray-400 mt-0.5 uppercase tracking-widest">STATION ID: ${escape_html(machine.name.replace(/\s+/g, "_").toUpperCase())}</span></div> <div${attr_class(`h-6 w-6 rounded-full flex items-center justify-center border-2 shrink-0 ${stringify(machine.hasGaps ? "bg-amber-500 border-amber-600 animate-pulse" : "bg-emerald-500 border-emerald-600")}`)}><span class="text-white text-[10px] font-black">${escape_html(machine.hasGaps ? "!" : "✓")}</span></div></div> <div class="mt-3 bg-gray-50 p-2 border-l-4 border-blue-600"><span class="text-[7px] font-black text-gray-400 uppercase block mb-0.5 tracking-widest">Last Running Family</span> <span class="text-[10px] font-black text-[#1A1A1A] uppercase truncate block tracking-tight">${escape_html(`${machine.currentFamily || "—"} ${machine?.currentServerProcess?.toString()?.includes("SPI_S2") ? "(2)" : ""}`)}</span></div> <div class="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between"><div class="flex flex-col"><span class="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Status</span> <span${attr_class(`text-[10px] font-black uppercase ${stringify(machine.hasGaps ? "text-amber-600" : "text-emerald-600")}`)}>${escape_html(machine.hasGaps ? `${machine.pendingCount} Gaps Pending` : "Capture Clean")}</span></div> <span class="text-[9px] font-black text-[#1A1A1A] bg-gray-100 px-2 py-1 group-hover:bg-[#FF4F00] group-hover:text-white transition-all transform group-hover:translate-x-0.5">OPEN →</span></div></a>`);
		}
		$$renderer.push(`<!--]--></div></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Production Capture Service</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-nIY6_vuB.js.map
