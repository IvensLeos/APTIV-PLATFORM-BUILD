import { S as attr, T as attr_class, U as escape_html, a7 as ensure_array_like, V as stringify } from './dev-CorMzolj.js';
import './client-Bs4aGKPH.js';
import './index-server-CQ5DdqbI.js';
import './internal-DB3GJevE.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/conversions-scrape/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let isRunning = false;
		let consoleLogs = [];
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-8 text-[#1A1A1A] font-sans select-none"><header class="mb-8 flex flex-col lg:flex-row lg:items-end justify-between border-b-4 border-[#1A1A1A] pb-6 gap-4"><div><span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase block mb-1">Development Support &amp; Utilities</span> <h1 class="text-5xl font-black tracking-tighter text-[#1A1A1A] uppercase leading-none">Part Conversions Scrape</h1></div> <div class="bg-white border-2 border-[#1A1A1A] p-4 shadow-md flex flex-col sm:flex-row items-stretch sm:items-end gap-4"><div class="flex flex-col"><span class="text-[8px] font-black text-gray-400 uppercase mb-1">Report Structure Layout</span> <div class="grid grid-cols-2 bg-[#F4F4F4] p-0.5 border border-gray-300 rounded-xs"><button type="button"${attr("disabled", isRunning, true)}${attr_class(`text-[9px] font-black uppercase tracking-tight px-3 py-1.5 transition-colors cursor-pointer disabled:opacity-50 ${stringify("bg-[#1A1A1A] text-white" )}`)}>📊 SPI MODE</button> <button type="button"${attr("disabled", isRunning, true)}${attr_class(`text-[9px] font-black uppercase tracking-tight px-3 py-1.5 transition-colors cursor-pointer disabled:opacity-50 ${stringify("text-gray-600 hover:text-[#1A1A1A]")}`)}>🏷️ BOARD LABEL</button></div></div> <div class="flex flex-col"><label for="start-datepicker" class="text-[8px] font-black text-gray-400 uppercase mb-1">Target Start Reference</label> <input id="start-datepicker" type="date"${attr("value", selectedDate)}${attr("disabled", isRunning, true)} class="border-2 border-gray-200 px-3 py-1.5 font-mono text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FF4F00] uppercase disabled:opacity-50 h-[30px]"/></div> <button${attr_class(`font-black text-[10px] uppercase tracking-wider px-6 py-2.5 transition-colors cursor-pointer shadow-xs active:scale-98 h-[30px] flex items-center justify-center ${stringify("bg-[#1A1A1A] text-white hover:bg-[#FF4F00]")}`)}>`);
		{
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<span>🚀 RUN EXTRACTOR</span>`);
		}
		$$renderer.push(`<!--]--></button></div></header> <main class="bg-[#0F172A] border-4 border-[#1A1A1A] shadow-2xl overflow-hidden flex flex-col h-[520px] rounded-xs"><header class="bg-[#1E293B] border-b border-[#334155] p-3 flex justify-between items-center px-4"><div class="flex items-center gap-2"><div${attr_class(`w-2.5 h-2.5 rounded-full ${stringify("bg-red-500")}`)}></div> <span class="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">${escape_html("🔴 Engine Standby")}</span></div> <button${attr("disabled", isRunning, true)} class="text-[9px] font-mono font-black text-slate-400 hover:text-white bg-slate-800 px-3 py-1 border border-slate-700 uppercase cursor-pointer tracking-tight transition-colors disabled:opacity-30">🧹 Clear Console</button></header> <div class="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1 selection:bg-slate-700 selection:text-white"><div class="text-slate-500 italic mb-2">// Aptiv Infinite Diagnostic Terminal v2.1.1. A11Y Warning Patched.</div> `);
		const each_array = ensure_array_like(consoleLogs);
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let log = each_array[i];
				$$renderer.push(`<div class="flex items-start gap-4 leading-relaxed border-b border-slate-900/40 pb-0.5"><span class="text-slate-500 whitespace-nowrap">[${escape_html(log.timestamp)}]</span> <span${attr_class(`flex-1 whitespace-pre-wrap ${stringify(log.type === "error" ? "text-red-400 font-bold" : log.type === "success" ? "text-emerald-400 font-bold" : log.type === "warning" ? "text-amber-400 font-bold" : "text-slate-300")}`)}>${escape_html(log.message)}</span></div>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<div class="text-slate-600 italic py-4">Consola vacía. Configure el layout de ingeniería, el datepicker y presione RUN EXTRACTOR para iniciar el barrido infinito...</div>`);
		}
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></main></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Part Conversions Scrape Utility</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DzBBzWYY.js.map
