import { T as attr_class, U as escape_html, S as attr, a6 as ensure_array_like, V as stringify, K as derived } from './dev-BeB9xBTu.js';
import './client-BvSdefav.js';
import './index-server-D1jVuM2R.js';
import './internal-BsbvprU4.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/taxonomy/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let items = [];
		let rates = [];
		let conversions = [];
		let activeModule = "ITEMS";
		let searchTerm = "";
		let bulkTarget = "";
		let bulkJsonData = "";
		const filteredItems = derived(() => items.filter((i) => i.PARTNUMBER.toUpperCase().includes(searchTerm.toUpperCase()) || i.FAMILY.toUpperCase().includes(searchTerm.toUpperCase())));
		$$renderer.push(`<div class="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased"><aside class="w-64 bg-slate-900 text-slate-300 sticky top-0 h-screen flex flex-col shadow-xl border-r border-slate-800"><header class="p-6 border-b border-slate-800 bg-slate-950 flex items-center gap-3"><div class="h-8 w-8 bg-[#FF4F00] flex items-center justify-center font-black text-white rounded text-sm tracking-tighter">AP</div> <div><h2 class="text-xs font-black text-white uppercase tracking-wider leading-none">Aptiv Operating System</h2> <span class="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest mt-1 block">Taxonomy Platform</span></div></header> <nav class="flex-1 p-3 flex flex-col gap-1.5 mt-4"><button${attr_class(`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase transition-all rounded-lg cursor-pointer ${stringify("bg-[#FF4F00] text-white font-extrabold shadow-lg shadow-orange-600/10" )}`)}><span>📦 Items Taxonomy</span> <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">${escape_html(items.length)}</span></button> <button${attr_class(`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase transition-all rounded-lg cursor-pointer ${stringify("text-slate-400 hover:bg-slate-800 hover:text-white")}`)}><span>⏱️ Standard Rates</span> <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">${escape_html(rates.length)}</span></button> <button${attr_class(`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase transition-all rounded-lg cursor-pointer ${stringify("text-slate-400 hover:bg-slate-800 hover:text-white")}`)}><span>🔄 ERP Conversions</span> <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">${escape_html(conversions.length)}</span></button> <div class="border-t border-slate-800 my-3 pt-3"><button${attr_class(`w-full flex items-center justify-between px-4 py-2.5 text-xs font-black uppercase transition-all rounded-lg cursor-pointer ${stringify("bg-amber-500/10 text-amber-400 hover:bg-amber-500/20")}`)}><span>⚠️ Diagnostic Gaps</span> <span class="text-[10px] bg-slate-950 font-black px-2 py-0.5 rounded font-mono text-amber-400 animate-pulse">${escape_html(data.gaps?.taxonomy?.length + data.gaps?.rates?.length)}</span></button></div></nav></aside> <main class="flex-1 p-8 overflow-x-hidden"><header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6 mb-6"><div><h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">${escape_html(activeModule)} Management Board</h1> <p class="text-xs text-slate-500 mt-1">Configuración centralizada de catálogos y estándares operativos de manufactura.</p> <div class="w-80 mt-4"><input type="text"${attr("value", searchTerm)} placeholder="🔍 Filter rows by key attributes..." class="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF4F00] transition-colors placeholder:text-slate-400"/></div></div> <div class="flex items-center gap-3">`);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all cursor-pointer">➕ Append Blank Row</button> <label class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md tracking-wider transition-all select-none cursor-pointer">📥 Ingest CSV Dataset <input type="file" accept=".csv" class="hidden"/></label>`);
		}
		$$renderer.push(`<!--]--></div></header> <form method="POST" action="?/bulkImportTaxonomy" class="hidden"><input type="hidden" name="targetCollection"${attr("value", bulkTarget)}/> <input type="hidden" name="jsonData"${attr("value", bulkJsonData)}/> <button type="submit" id="btnSubmitBulk">Submit</button></form> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-rose-50 border border-rose-200 p-4 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-lg mb-6">⚠️ CRITICAL: ${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<!--[-->`);
			const each_array_2 = ensure_array_like(filteredItems());
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let row = each_array_2[$$index_2];
				$$renderer.push(`<form${attr("id", `form_${stringify(row.id)}`)} method="POST" action="?/saveRow" class="hidden"><input type="hidden" name="mode" value="ITEM"/> <input type="hidden" name="partNumber"${attr("value", row.PARTNUMBER)}/> <input type="hidden" name="family"${attr("value", row.FAMILY)}/> <input type="hidden" name="type"${attr("value", row.TYPE)}/> <input type="hidden" name="level"${attr("value", row.LEVEL)}/> <button type="submit">Save</button></form>`);
			}
			$$renderer.push(`<!--]--> <div class="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-fade-in"><table class="w-full text-left border-collapse table-fixed"><thead><tr class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider"><th class="p-4 w-[200px] border-r border-slate-100">Part Number (Immutable Key)</th><th class="p-4 border-r border-slate-100">Product Family Taxonomy</th><th class="p-4 w-[160px] border-r border-slate-100 text-center">Component Type</th><th class="p-4 w-[160px] text-center border-r border-slate-100">Build Level</th><th class="p-4 w-[80px] text-center">Actions</th></tr></thead><tbody class="divide-y divide-slate-100 text-xs text-slate-800 font-medium"><!--[-->`);
			const each_array_3 = ensure_array_like(filteredItems());
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let row = each_array_3[$$index_3];
				$$renderer.push(`<tr${attr_class(`hover:bg-slate-50/50 transition-colors ${stringify(row.isNew ? "bg-amber-500/5 font-semibold" : "")}`)}><td class="p-1 border-r border-slate-100 font-mono"><input type="text"${attr("form", `form_${stringify(row.id)}`)}${attr("value", row.PARTNUMBER)}${attr("readonly", !row.isNew, true)} placeholder="ENTER PART NUMBER..." class="w-full bg-transparent border-0 px-3 py-2 font-mono text-xs font-bold uppercase outline-none focus:bg-orange-500/5 read-only:text-slate-400"/></td><td class="p-1 border-r border-slate-100"><input type="text"${attr("form", `form_${stringify(row.id)}`)}${attr("value", row.FAMILY)} placeholder="ASSIGN FAMILY OR MODEL NAME..." class="w-full bg-transparent border-0 px-3 py-2 font-bold text-slate-900 outline-none uppercase placeholder:text-slate-300 focus:bg-orange-500/5"/></td><td class="p-1 border-r border-slate-100"><input type="text"${attr("form", `form_${stringify(row.id)}`)}${attr("value", row.TYPE)} class="w-full bg-transparent border-0 px-3 py-2 text-center font-bold text-slate-500 outline-none uppercase focus:bg-orange-500/5"/></td><td class="p-1 border-r border-slate-100"><input type="text"${attr("form", `form_${stringify(row.id)}`)}${attr("value", row.LEVEL)} class="w-full bg-transparent border-0 px-3 py-2 text-center font-bold text-slate-500 outline-none uppercase focus:bg-orange-500/5"/></td><td class="p-1 text-center whitespace-nowrap"><form method="POST" action="?/deleteRow" class="m-0 p-0"><input type="hidden" name="mode" value="ITEM"/><input type="hidden" name="key1"${attr("value", row.PARTNUMBER)}/> <button type="submit"${attr("disabled", row.isNew, true)} class="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 px-3 py-1 font-bold uppercase text-[9px] cursor-pointer disabled:opacity-20 border border-rose-100 rounded-md transition-colors">✕</button></form></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div>`);
		}
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main></div> <footer class="max-w-7xl mx-auto p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Operational Parameters &amp; Enterprise Control Interface</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C8oZdhY1.js.map
