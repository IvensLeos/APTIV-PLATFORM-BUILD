import { U as escape_html, T as attr_class, V as stringify, a7 as ensure_array_like, S as attr, K as derived } from './dev-Dhosxf2u.js';
import './client-BJpSpMnO.js';
import './index-server-BJox0gTe.js';
import './internal-BtmYaD7j.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/taxonomy/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const TYPES = [
			"RADAR",
			"CONTROLLER",
			"CAMERA",
			"MRR ADAS",
			"IFV300",
			"VOLVO DHU",
			"IFV600",
			"VOLVO VIU",
			"GM DMS"
		];
		const LEVELS = [
			"RAW BOARD",
			"BOARD",
			"MODULE"
		];
		const PAGE = 80;
		let items = [];
		let rates = [];
		let conversions = [];
		let activeModule = "ITEMS";
		let searchTerm = "";
		let pageSize = PAGE;
		let loadingId = null;
		let bulkTarget = "";
		let bulkJsonData = "";
		const term = derived(() => searchTerm.trim().toUpperCase());
		const filteredItems = derived(() => items.filter((row) => !term() || `${row.PARTNUMBER} ${row.FAMILY} ${row.TYPE} ${row.LEVEL}`.toUpperCase().includes(term())));
		const activeRows = derived(() => filteredItems() );
		const visibleRows = derived(() => activeRows().slice(0, pageSize));
		const gapCount = derived(() => (data.gaps?.taxonomy?.length || 0) + (data.gaps?.rates?.length || 0));
		function optionsWith(current, list) {
			return current && !list.includes(current) ? [current, ...list] : list;
		}
		function triggerInlineSave(id) {
			const targetForm = document.getElementById(`form_${id}`);
			if (!targetForm) return;
			loadingId = id;
			targetForm.querySelector("button[type=\"submit\"]")?.click();
		}
		$$renderer.push(`<div class="mx-auto min-h-screen max-w-7xl bg-[#F4F4F4] p-6 font-sans"><header class="mb-6 flex flex-col justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 lg:flex-row lg:items-end"><div><span class="mb-1 block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Catalogs</span> <h1 class="text-4xl leading-none font-black tracking-tighter text-[#1A1A1A] uppercase">Taxonomy</h1> <p class="mt-2 text-[11px] font-bold text-gray-500 uppercase">Parts, standard rates, and the ERP conversion table. Gaps use the last 21 days of production.</p></div> <div class="grid grid-cols-2 gap-2 sm:grid-cols-4"><div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Parts</span><span class="font-mono text-lg font-black">${escape_html(items.length.toLocaleString("en-US"))}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Rates</span><span class="font-mono text-lg font-black">${escape_html(rates.length.toLocaleString("en-US"))}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Conversions</span><span class="font-mono text-lg font-black">${escape_html(conversions.length.toLocaleString("en-US"))}</span></div> <div class="bg-[#1A1A1A] px-4 py-3 text-white"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Gaps</span><span${attr_class(`font-mono text-lg font-black ${stringify(gapCount() ? "text-[#FF4F00]" : "")}`)}>${escape_html(gapCount().toLocaleString("en-US"))}</span></div></div></header> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-red-600 bg-red-50 p-4 text-[11px] font-black tracking-widest text-red-700 uppercase">${escape_html(data.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-red-600 bg-red-50 p-4 text-[11px] font-black tracking-widest text-red-700 uppercase">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <section class="mb-4 flex flex-wrap items-end justify-between gap-3 border bg-white p-4 shadow-sm"><div class="flex flex-wrap gap-1"><!--[-->`);
		const each_array = ensure_array_like([
			[
				"ITEMS",
				"Parts",
				items.length
			],
			[
				"RATES",
				"Rates",
				rates.length
			],
			[
				"CONVERSIONS",
				"Conversions",
				conversions.length
			],
			[
				"GAPS",
				"Gaps",
				gapCount()
			]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [id, label, count] = each_array[$$index];
			$$renderer.push(`<button type="button"${attr_class(`border-2 px-3 py-2 text-[10px] font-black uppercase ${stringify(activeModule === id ? "border-black bg-black text-white" : "border-zinc-200 bg-white text-zinc-500")}`)}>${escape_html(label)} <span class="ml-1 font-mono">${escape_html(count.toLocaleString("en-US"))}</span></button>`);
		}
		$$renderer.push(`<!--]--></div> <div class="flex flex-wrap items-end gap-2"><label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Search <input type="search"${attr("value", searchTerm)} placeholder="Part, family, machine" class="w-56 border-2 border-black bg-white px-2 py-1.5 text-[10px] font-black text-zinc-900 uppercase outline-none placeholder:text-gray-400"/></label> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button type="button" class="border-2 border-black bg-black px-3 py-1.5 text-[10px] font-black text-white uppercase">Add row</button> <label class="cursor-pointer border-2 border-[#FF4F00] bg-[#FF4F00] px-3 py-1.5 text-[10px] font-black text-white uppercase">Import CSV <input type="file" accept=".csv,text/csv" class="hidden"/></label>`);
		}
		$$renderer.push(`<!--]--> `);
		if (loadingId) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase">Saving</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></section> <form method="POST" action="?/bulkImportTaxonomy" class="hidden"><input type="hidden" name="targetCollection"${attr("value", bulkTarget)}/> <input type="hidden" name="jsonData"${attr("value", bulkJsonData)}/> <button type="submit" id="btnSubmitBulk">Submit</button></form> `);
		{
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--[-->`);
			const each_array_3 = ensure_array_like(visibleRows());
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let row = each_array_3[$$index_3];
				$$renderer.push(`<form${attr("id", `form_${stringify(row.id)}`)} method="POST" action="?/saveRow" class="hidden"><input type="hidden" name="mode"${attr("value", "ITEM" )}/> `);
				{
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<input type="hidden" name="partNumber"${attr("value", row.PARTNUMBER)}/> <input type="hidden" name="family"${attr("value", row.FAMILY)}/> <input type="hidden" name="type"${attr("value", row.TYPE)}/> <input type="hidden" name="level"${attr("value", row.LEVEL)}/>`);
				}
				$$renderer.push(`<!--]--> <button type="submit">Save</button></form>`);
			}
			$$renderer.push(`<!--]--> <div class="overflow-x-auto border bg-white shadow-sm"><table class="w-full border-collapse text-left"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-wider text-white uppercase">`);
			{
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<th class="px-3 py-2">Part number</th> <th class="px-3 py-2">Family</th> <th class="px-3 py-2">Value stream</th> <th class="px-3 py-2">Level</th>`);
			}
			$$renderer.push(`<!--]--><th class="w-16 px-3 py-2"></th></tr></thead><tbody>`);
			const each_array_4 = ensure_array_like(visibleRows());
			if (each_array_4.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_7 = 0, $$length = each_array_4.length; $$index_7 < $$length; $$index_7++) {
					let row = each_array_4[$$index_7];
					$$renderer.push(`<tr${attr_class(`border-b border-zinc-100 text-[11px] ${stringify(row.isNew ? "bg-orange-50" : "")}`)}>`);
					{
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<td class="px-2 py-1"><input${attr("form", `form_${stringify(row.id)}`)}${attr("value", row.PARTNUMBER)}${attr("readonly", !row.isNew, true)} placeholder="Part number" class="w-full bg-transparent px-1 py-1 font-mono text-[11px] font-black uppercase outline-none read-only:text-zinc-400"/></td> <td class="px-2 py-1"><input${attr("form", `form_${stringify(row.id)}`)}${attr("value", row.FAMILY)} placeholder="Family" class="w-full bg-transparent px-1 py-1 font-black uppercase outline-none"/></td> <td class="px-2 py-1">`);
						$$renderer.select({
							form: `form_${stringify(row.id)}`,
							value: row.TYPE,
							onchange: () => row.PARTNUMBER && triggerInlineSave(row.id),
							class: "w-full bg-transparent px-1 py-1 text-[10px] font-black uppercase outline-none"
						}, ($$renderer) => {
							$$renderer.push(`<!--[-->`);
							const each_array_5 = ensure_array_like(optionsWith(row.TYPE, TYPES));
							for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
								let type = each_array_5[$$index_4];
								$$renderer.option({ value: type }, ($$renderer) => {
									$$renderer.push(`${escape_html(type)}`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
						$$renderer.push(`</td> <td class="px-2 py-1">`);
						$$renderer.select({
							form: `form_${stringify(row.id)}`,
							value: row.LEVEL,
							onchange: () => row.PARTNUMBER && triggerInlineSave(row.id),
							class: "w-full bg-transparent px-1 py-1 text-[10px] font-black uppercase outline-none"
						}, ($$renderer) => {
							$$renderer.push(`<!--[-->`);
							const each_array_6 = ensure_array_like(optionsWith(row.LEVEL, LEVELS));
							for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
								let level = each_array_6[$$index_5];
								$$renderer.option({ value: level }, ($$renderer) => {
									$$renderer.push(`${escape_html(level)}`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
						$$renderer.push(`</td>`);
					}
					$$renderer.push(`<!--]--><td class="px-2 py-1 text-center"><form method="POST" action="?/deleteRow" class="m-0"><input type="hidden" name="mode"${attr("value", "ITEM" )}/> <input type="hidden" name="key1"${attr("value", row.PARTNUMBER)}/> <input type="hidden" name="key2"${attr("value", "")}/> <button type="submit"${attr("disabled", row.isNew, true)} class="text-[9px] font-black text-red-600 uppercase disabled:opacity-20">Delete</button></form></td></tr>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<tr><td colspan="5" class="px-3 py-10 text-center text-[11px] font-black tracking-widest text-gray-400 uppercase">No rows match this search</td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div> `);
			if (activeRows().length > visibleRows().length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="mt-3 flex items-center justify-between gap-3"><p class="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Showing ${escape_html(visibleRows().length.toLocaleString("en-US"))} of ${escape_html(activeRows().length.toLocaleString("en-US"))}</p> <button type="button" class="border-2 border-black bg-white px-3 py-1.5 text-[10px] font-black uppercase">Show more</button></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CUDFfDB_.js.map
