import { S as attr, U as escape_html, a7 as ensure_array_like, T as attr_class, V as stringify, K as derived } from './dev-CorMzolj.js';
import './client-C7VjdJoc.js';
import './index-server-CQ5DdqbI.js';
import './internal-BJFHYuUe.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/mapping/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let isSyncing = false;
		let searchQuery = "";
		const filteredGaps = derived(() => {
			return data.gaps;
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] font-sans antialiased text-[#1A1A1A]">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <header class="max-w-7xl mx-auto p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#1A1A1A] mb-8"><div><h1 class="text-4xl font-black tracking-tighter uppercase leading-none">Integrity Manager</h1> <p class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-3 bg-white inline-block px-2 py-1">Master Data Gap Analysis</p></div> <div class="flex items-center gap-8"><form method="POST" action="?/syncLogs"><button type="submit"${attr("disabled", isSyncing, true)} class="bg-[#1A1A1A] text-white text-[10px] font-black px-8 py-4 uppercase tracking-widest hover:bg-[#FF4F00] disabled:bg-gray-300 transition-all cursor-pointer shadow-lg active:scale-95">${escape_html("REPROCESS LOGS")}</button></form> <div class="flex flex-col items-end border-l-4 border-red-600 pl-4"><span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Gaps</span> <span class="text-3xl font-black text-red-600 tabular-nums leading-none">${escape_html(data.gaps.length)}</span></div></div></header> <main class="max-w-7xl mx-auto px-6 pb-20"><div class="max-w-7xl mx-auto mb-6"><div class="relative group"><span class="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-[#FF4F00] transition-colors"><svg xmlns="http://w3.org" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></span> <input type="text"${attr("value", searchQuery)} placeholder="SEARCH BY STATION, MACHINE OR PART NUMBER..." class="w-full bg-white border-2 border-gray-200 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#FF4F00] shadow-sm transition-all placeholder:text-gray-300"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> <div class="bg-white shadow-2xl border border-gray-200"><table class="w-full text-left border-collapse"><thead><tr class="bg-[#1A1A1A] text-[9px] uppercase tracking-widest text-white font-black"><th class="px-6 py-5 border-r border-gray-800">Station / Machine</th><th class="px-6 py-5 border-r border-gray-800">Part Number</th><th class="px-6 py-5 border-r border-gray-800 text-center">Status</th><th class="px-6 py-5 text-right">Corrective Actions</th></tr></thead><tbody class="divide-y divide-gray-100 font-sans">`);
		const each_array = ensure_array_like(filteredGaps());
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let log = each_array[$$index];
				$$renderer.push(`<tr class="hover:bg-gray-50 transition-all border-l-4 border-transparent hover:border-[#FF4F00]"><td class="px-6 py-5 border-r border-gray-50 bg-gray-50/30"><div class="flex flex-col">`);
				if (log.MACHINE !== "UNKNOWN") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-xs font-black text-[#1A1A1A] uppercase leading-tight italic">${escape_html(log.MACHINE)}</span> <span class="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-tighter">ID: ${escape_html(log.STATION)}</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="text-[10px] font-mono font-black text-red-600 bg-red-50 px-3 py-1 border border-red-200 uppercase inline-block w-fit">UNMAPPED: ${escape_html(log.STATION)}</span>`);
				}
				$$renderer.push(`<!--]--></div></td><td class="px-6 py-5 border-r border-gray-50"><span class="text-sm font-black text-blue-600 tabular-nums">${escape_html(log.PARTNUMBER)}</span></td><td class="px-6 py-5 border-r border-gray-50"><div class="flex justify-center gap-1.5">`);
				if (log.masterStation?.length === 0 || log.MACHINE === "UNKNOWN") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="px-2 py-1 text-[8px] font-black uppercase bg-red-100 text-red-700 border border-red-200">STATION GAP</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (log.masterItem?.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="px-2 py-1 text-[8px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">ITEM GAP</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (log.masterRate?.length === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="px-2 py-1 text-[8px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">RATE GAP</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></td><td class="px-6 py-5 text-right bg-gray-50/20"><div class="flex justify-end gap-2"><button${attr_class(`px-4 py-2 text-[9px] font-black border-2 border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer uppercase ${stringify(log.MACHINE !== "UNKNOWN" ? "hidden" : "")}`)}>Map Station</button> <button${attr_class(`px-4 py-2 text-[9px] font-black border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer uppercase ${stringify(log.masterItem?.length !== 0 ? "hidden" : "")}`)}>Map Item</button> <button${attr_class(`px-4 py-2 text-[9px] font-black border-2 border-amber-500 bg-white text-amber-600 hover:bg-amber-500 hover:text-white transition-all cursor-pointer uppercase ${stringify(log.masterRate?.length !== 0 ? "hidden" : "")}`)}>Set Rate</button></div></td></tr>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="4" class="px-6 py-32 text-center text-gray-300 text-xs font-black uppercase italic tracking-[0.5em]">No data integrity issues detected</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></main> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <footer class="max-w-7xl mx-auto p-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System • Integrity Manager</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BWY-xJ6-.js.map
