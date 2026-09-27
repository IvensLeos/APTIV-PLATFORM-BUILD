import { T as attr_class, V as stringify, U as escape_html, S as attr, a7 as ensure_array_like, K as derived } from './dev-CorMzolj.js';
import './client-Bs4aGKPH.js';
import './index-server-CQ5DdqbI.js';
import './internal-DB3GJevE.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/scrapelogs/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const logs = derived(() => data.logs || []);
		let searchTerm = "";
		const filteredLogs = derived(() => logs().filter((log) => log.server.toUpperCase().includes(searchTerm.toUpperCase()) || log.status.toUpperCase().includes(searchTerm.toUpperCase()) || log.message.toUpperCase().includes(searchTerm.toUpperCase())));
		const auditStats = derived(() => {
			const total = logs().length;
			const errors = logs().filter((l) => l.status === "ERROR").length;
			return {
				errors,
				totalRecordsScraped: logs().reduce((acc, l) => acc + (l.records || 0), 0),
				successRate: total > 0 ? Math.round((total - errors) / total * 100) : 100
			};
		});
		function formatLogDate(isoString) {
			if (!isoString) return "—";
			return new Date(isoString).toLocaleString("es-MX", { timeZone: "UTC" }) + " UTC";
		}
		$$renderer.push(`<div class="max-w-7xl mx-auto p-4 bg-[#FBFBFB] min-h-screen font-sans"><header class="flex flex-col lg:flex-row lg:items-end justify-between border-b-4 border-[#1A1A1A] pb-6 mb-8 gap-4"><div><span class="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.3em] block mb-1">System Audit Trail</span> <h1 class="text-5xl font-black uppercase tracking-tighter text-[#1A1A1A] leading-none">Scraper Engine Logs</h1></div> <div class="flex flex-wrap items-center gap-4 bg-[#1A1A1A] text-white px-6 py-3 shadow-xl border-b-4 border-[#FF4F00]"><div class="flex flex-col border-r border-slate-700 pr-4"><span class="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Sync Health</span> <span${attr_class(`text-xs font-mono font-black ${stringify(auditStats().successRate < 90 ? "text-red-400" : "text-emerald-400")}`)}>${escape_html(auditStats().successRate)}% Success</span></div> <div class="flex flex-col border-r border-slate-700 pr-4"><span class="text-[8px] font-bold uppercase text-gray-400 tracking-wider">Incidents</span> <span${attr_class(`text-xs font-mono font-black ${stringify(auditStats().errors > 0 ? "text-red-500 animate-pulse" : "text-gray-400")}`)}>${escape_html(auditStats().errors)} Errors</span></div> <div class="flex flex-col"><span class="text-[8px] font-bold uppercase text-gray-400 tracking-wider">Total Extracted</span> <span class="text-xs font-mono font-black text-sky-400 text-center">${escape_html(auditStats().totalRecordsScraped)} Pcs</span></div></div></header> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border-2 border-red-500 p-4 text-red-700 text-xs font-black uppercase tracking-widest mb-6">⚠️ ${escape_html(data.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <section class="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border-2 border-slate-200 rounded-sm shadow-xs"><div class="w-full md:w-80 relative"><input type="text"${attr("value", searchTerm)} placeholder="🔍 SEARCH LOGS (SERVER, STATUS, ERROR)..." class="w-full bg-slate-50 border border-slate-300 p-2.5 text-[10px] font-black uppercase outline-none focus:border-[#1A1A1A] focus:bg-white transition-colors"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex flex-wrap gap-1.5 w-full md:w-auto"><!--[-->`);
		const each_array = ensure_array_like([
			"ALL",
			"REMAN61A",
			"REMAN65",
			"REDBC001"
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let node = each_array[$$index];
			$$renderer.push(`<a${attr("href", `?server=${stringify(node)}`)}${attr_class(`text-[10px] font-black px-4 py-2 border-2 uppercase transition-all ${stringify(data.currentFilter === node ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-md" : "bg-white border-slate-200 text-slate-400 hover:border-[#FF4F00] hover:text-[#FF4F00]")}`)}>${escape_html(node)}</a>`);
		}
		$$renderer.push(`<!--]--></div></section> <div class="bg-white shadow-2xl border border-gray-200 overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-left border-collapse table-fixed"><thead><tr class="bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-wider"><th class="p-3 w-[220px] border-r border-gray-800">Timestamp Log</th><th class="p-3 w-[120px] border-r border-gray-800 text-center text-orange-400">Target Node</th><th class="p-3 w-[80px] border-r border-gray-800 text-center">Shift</th><th class="p-3 w-[100px] border-r border-gray-800 text-center">Engine Status</th><th class="p-3 w-[90px] border-r border-gray-800 text-center text-blue-400">Total Recs</th><th class="p-3 w-[140px] border-r border-gray-800 text-center text-emerald-400">ETL Breakdown</th><th class="p-3 w-[350px]">System Notification Message / Trace</th></tr></thead><tbody class="divide-y divide-gray-100 font-sans text-xs text-[#1A1A1A]">`);
		const each_array_1 = ensure_array_like(filteredLogs());
		if (each_array_1.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let log = each_array_1[$$index_1];
				$$renderer.push(`<tr${attr_class(`hover:bg-gray-50 border-l-4 border-transparent hover:border-[#FF4F00] ${stringify(log.status === "ERROR" ? "bg-red-50/30" : "")}`)}><td class="p-3 font-mono font-black text-gray-500 border-r border-gray-50 whitespace-nowrap">${escape_html(formatLogDate(log.timestamp))}</td><td class="p-3 border-r border-gray-50 text-center font-mono font-black uppercase tracking-tight text-slate-800">${escape_html(log.server)}</td><td class="p-3 border-r border-gray-50 text-center font-black"><span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">${escape_html(log.shift)}</span></td><td class="p-3 border-r border-gray-50 text-center font-mono whitespace-nowrap"><span${attr_class(`px-2.5 py-1 rounded text-[9px] font-black border uppercase tracking-wider ${stringify(log.status === "SUCCESS" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : log.status === "ERROR" ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-amber-50 border-amber-200 text-amber-600")}`)}>${escape_html(log.status)}</span></td><td class="p-3 text-center font-mono font-black border-r border-gray-50 text-slate-700">${escape_html(log.records)}</td><td class="p-3 border-r border-gray-50 font-mono text-[10px] text-slate-500 whitespace-nowrap"><div class="flex flex-col items-center gap-0.5"><span class="text-emerald-600 font-bold">➕ INS: ${escape_html(log.details.upserted)}</span> <span class="text-sky-600 font-bold">📝 MOD: ${escape_html(log.details.modified)}</span></div></td><td class="p-3 font-medium select-text max-w-sm break-words truncate hover:whitespace-normal">`);
				if (log.status === "ERROR") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="font-mono text-red-600 font-bold tracking-tight bg-red-50 border border-red-100 px-2 py-1 rounded block">${escape_html(log.message)}</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="text-slate-500 italic text-[11px]">${escape_html(log.message || "Ciclo de sincronización ejecutado con éxito.")}</span>`);
				}
				$$renderer.push(`<!--]--></td></tr>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="7" class="p-8 text-center text-gray-400 font-bold italic tracking-wide">No audit log records found for the active criteria.</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></div></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - System Control &amp; Audit Console</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-NE8tWElk.js.map
