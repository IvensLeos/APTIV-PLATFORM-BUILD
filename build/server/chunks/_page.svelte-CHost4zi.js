import { a7 as ensure_array_like, T as attr_class, U as escape_html, V as stringify, S as attr, a9 as clsx$1, K as derived } from './dev-Dhosxf2u.js';
import { i as isOeesPartNumber } from './partConversion-NydKHFLM.js';

//#region src/routes/admin/conversions-scrape/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const PAGE = 80;
		const TABS = [
			["new", "To add"],
			["conflict", "Different real part"],
			["same", "Already in catalog"],
			["rejected", "Excluded"]
		];
		let newerDate = plantToday();
		let olderDate = shiftIso(plantToday(), -30);
		let activeTab = "new";
		let searchTerm = "";
		let pageSize = PAGE;
		let isRunning = false;
		let isSaving = false;
		let rows = [];
		let activity = [];
		let armedFor = "";
		const term = derived(() => searchTerm.trim().toUpperCase());
		const counts = derived(() => ({
			new: rows.filter((row) => row.status === "new").length,
			conflict: rows.filter((row) => row.status === "conflict").length,
			same: rows.filter((row) => row.status === "same").length,
			rejected: rows.filter((row) => row.status === "rejected").length
		}));
		const filtered = derived(() => rows.filter((row) => {
			if (row.status !== activeTab) return false;
			if (!term()) return true;
			return `${row.SERVER_PARTNUMBER} ${row.SERVER_PROCESS} ${row.REAL_PARTNUMBER} ${row.FAMILY} ${row.existingReal || ""} ${row.sources.join(" ")}`.toUpperCase().includes(term());
		}));
		const visibleRows = derived(() => filtered().slice(0, pageSize));
		const selected = derived(() => rows.filter((row) => row.selected && (row.status === "new" || row.status === "conflict")));
		const selectionKey = derived(() => selected().map((row) => `${row.key}=${row.REAL_PARTNUMBER}`).join("|"));
		const armed = derived(() => !!selectionKey() && armedFor === selectionKey());
		const dateOrderInvalid = derived(() => olderDate > newerDate);
		function plantToday() {
			return new Intl.DateTimeFormat("en-CA", {
				timeZone: "America/Matamoros",
				year: "numeric",
				month: "2-digit",
				day: "2-digit"
			}).format(/* @__PURE__ */ new Date());
		}
		function shiftIso(iso, days) {
			const [year, month, day] = iso.split("-").map(Number);
			return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
		}
		$$renderer.push(`<div class="mx-auto min-h-screen max-w-[1440px] p-6"><header class="mb-6 flex flex-col justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 lg:flex-row lg:items-end"><div><span class="mb-1 block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Catalogs</span> <h1 class="text-4xl leading-none font-black tracking-tighter uppercase">Part conversions</h1> <p class="mt-2 max-w-2xl text-[11px] font-bold text-gray-500 uppercase">Read ERP mappings, keep numbers that are exactly 8 digits, and save only the rows you confirm into PART_CONVERSIONS.</p></div> <div class="grid grid-cols-2 gap-2 sm:grid-cols-4"><!--[-->`);
		const each_array = ensure_array_like(TABS);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [id, label] = each_array[$$index];
			$$renderer.push(`<button type="button"${attr_class(`px-4 py-3 text-left ${stringify(activeTab === id ? "bg-[#1A1A1A] text-white" : "bg-white text-[#1A1A1A]")}`)}><span${attr_class(`block text-[8px] font-bold tracking-wider uppercase ${stringify(activeTab === id ? "text-gray-400" : "text-gray-400")}`)}>${escape_html(label)}</span> <span${attr_class(`font-mono text-lg font-black ${stringify(id === "rejected" && counts()[id] ? "text-[#FF4F00]" : "")}`)}>${escape_html(counts()[id].toLocaleString("en-US"))}</span></button>`);
		}
		$$renderer.push(`<!--]--></div></header> <section class="mb-4 flex flex-col gap-4 border bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between"><div class="flex flex-wrap items-end gap-3"><div class="flex flex-col gap-1"><span class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Report</span> <div class="grid grid-cols-2 border-2 border-black"><button type="button"${attr("disabled", isRunning, true)}${attr_class(`px-3 py-2 text-[10px] font-black uppercase disabled:opacity-40 ${stringify("bg-black text-white" )}`)}>SPI</button> <button type="button"${attr("disabled", isRunning, true)}${attr_class(`px-3 py-2 text-[10px] font-black uppercase disabled:opacity-40 ${stringify("bg-white")}`)}>Board label</button></div></div> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Newer date <input type="date"${attr("value", newerDate)}${attr("disabled", isRunning, true)} class="border-2 border-black px-2 py-1.5 font-mono text-[11px] font-bold text-zinc-900 disabled:opacity-40"/></label> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Older date <input type="date"${attr("value", olderDate)}${attr("disabled", isRunning, true)} class="border-2 border-black px-2 py-1.5 font-mono text-[11px] font-bold text-zinc-900 disabled:opacity-40"/></label> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<button type="button"${attr("disabled", dateOrderInvalid(), true)} class="bg-black px-4 py-2 text-[10px] font-black text-white uppercase disabled:opacity-40">Read from ERP</button>`);
		$$renderer.push(`<!--]--></div> <p class="max-w-sm text-[10px] font-bold text-gray-500 uppercase">`);
		{
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`SPI reads the model. SPI_S2 is also proposed for AOI_PTH, XRAY and ICT.`);
		}
		$$renderer.push(`<!--]--> Each step covers three days and stops at the older date.</p></section> `);
		if (dateOrderInvalid()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-red-600 bg-red-50 p-3 text-[11px] font-black tracking-widest text-red-700 uppercase">The older date has to be on or before the newer date.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (activity.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 max-h-28 overflow-y-auto border bg-[#1A1A1A] px-3 py-2 font-mono text-[10px] text-slate-300"><!--[-->`);
			const each_array_1 = ensure_array_like(activity);
			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let line = each_array_1[i];
				$$renderer.push(`<div${attr_class(clsx$1(line.type === "error" ? "text-red-400" : line.type === "warning" ? "text-amber-300" : line.type === "success" ? "text-emerald-400" : ""))}>[${escape_html(line.at)}] ${escape_html(line.message)}</div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <section class="mb-4 flex flex-wrap items-end justify-between gap-3 border bg-white p-4 shadow-sm"><label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Search <input type="search"${attr("value", searchTerm)} placeholder="Part, process, family" class="w-64 border-2 border-black px-2 py-1.5 text-[10px] font-black uppercase outline-none placeholder:text-gray-400"/></label> <div class="flex flex-wrap items-center gap-2"><button type="button" class="border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase">Select filtered rows</button> <button type="button" class="border-2 border-zinc-200 px-3 py-1.5 text-[10px] font-black text-zinc-500 uppercase">Clear</button> <button type="button"${attr("disabled", !selected().length || isSaving, true)} class="bg-[#FF4F00] px-4 py-1.5 text-[10px] font-black text-white uppercase disabled:opacity-30">`);
		if (armed()) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`Confirm ${escape_html(selected().length.toLocaleString("en-US"))} to catalog`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`Save ${escape_html(selected().length.toLocaleString("en-US"))} to catalog`);
		}
		$$renderer.push(`<!--]--></button></div></section> <div class="overflow-x-auto border bg-white shadow-sm"><table class="w-full border-collapse text-left"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-wider text-white uppercase"><th class="w-10 px-3 py-2"></th><th class="px-3 py-2">ERP part</th><th class="px-3 py-2">ERP process</th><th class="px-3 py-2">Real part</th><th class="px-3 py-2">In catalog</th><th class="px-3 py-2">Family</th><th class="px-3 py-2">Source</th><th class="px-3 py-2">Note</th></tr></thead><tbody>`);
		const each_array_2 = ensure_array_like(visibleRows());
		if (each_array_2.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let row = each_array_2[$$index_2];
				const realValid = isOeesPartNumber(row.REAL_PARTNUMBER);
				const canSelect = row.status === "new" || row.status === "conflict";
				$$renderer.push(`<tr${attr_class(`border-b border-zinc-100 text-[11px] ${stringify(row.status === "rejected" ? "bg-red-50/60" : row.selected ? "bg-orange-50" : "")}`)}><td class="px-3 py-2"><input type="checkbox"${attr("checked", row.selected, true)}${attr("disabled", !canSelect, true)}${attr("aria-label", `Select ${row.SERVER_PARTNUMBER} ${row.SERVER_PROCESS}`)}/></td><td${attr_class(`px-3 py-2 font-mono font-black ${stringify(isOeesPartNumber(row.SERVER_PARTNUMBER) ? "" : "text-red-600")}`)}>${escape_html(row.SERVER_PARTNUMBER)}</td><td class="px-3 py-2 font-black uppercase">${escape_html(row.SERVER_PROCESS)}</td><td class="px-2 py-1"><input${attr("value", row.REAL_PARTNUMBER)}${attr("aria-label", `Real part for ${row.SERVER_PARTNUMBER} ${row.SERVER_PROCESS}`)}${attr_class(`w-28 border bg-transparent px-1 py-1 text-center font-mono font-black uppercase outline-none ${stringify(realValid ? "border-transparent" : "border-red-500 text-red-700")}`)}/></td><td class="px-3 py-2 font-mono font-bold text-zinc-500">${escape_html(row.existingReal || "—")}</td><td class="px-2 py-1"><input${attr("value", row.FAMILY)}${attr("aria-label", `Family for ${row.SERVER_PARTNUMBER}`)} class="w-full min-w-32 bg-transparent px-1 py-1 font-black uppercase outline-none"/></td><td class="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase">${escape_html(row.sources.join(", ") || "—")}</td><td class="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase">${escape_html(row.reason)}</td></tr>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="8" class="px-3 py-12 text-center text-[11px] font-black tracking-widest text-gray-400 uppercase">`);
			if (rows.length === 0 && activity.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`Set the dates and read from the ERP. New 8-digit conversions show up here before anything is written.`);
			} else if (rows.length === 0) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`No mappings came back. The log above has the server responses.`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`No rows in this tab match the search.`);
			}
			$$renderer.push(`<!--]--></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div> `);
		if (filtered().length > visibleRows().length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mt-3 flex items-center justify-between gap-3"><p class="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Showing ${escape_html(visibleRows().length.toLocaleString("en-US"))} of ${escape_html(filtered().length.toLocaleString("en-US"))}</p> <button type="button" class="border-2 border-black bg-white px-3 py-1.5 text-[10px] font-black uppercase">Show more</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Part Conversions Scrape Utility</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CHost4zi.js.map
