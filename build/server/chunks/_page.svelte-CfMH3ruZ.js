import { a2 as attr, a4 as escape_html, a7 as ensure_array_like, X as derived } from './dev-yuvcodp0.js';
import './client-KlLoW8e0.js';
import './internal-BRbcW4zN.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/failure-review/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let search = "";
		let pending = "";
		const term = derived(() => search.trim().toUpperCase());
		const candidates = derived(() => (data.candidates || []).filter((row) => !term() || `${row.part} ${row.process} ${row.family} ${row.level}`.toUpperCase().includes(term())));
		const confirmed = derived(() => (data.confirmed || []).filter((row) => !term() || `${row.part} ${row.process} ${row.error}`.toUpperCase().includes(term())));
		const accepted = derived(() => (data.accepted || []).filter((row) => !term() || `${row.part} ${row.process}`.toUpperCase().includes(term())));
		function qty(value) {
			return Math.round(Number(value) || 0).toLocaleString("en-US");
		}
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-8"><main class="mx-auto w-full max-w-7xl space-y-8"><header class="flex flex-col gap-4 border-b-4 border-[#1A1A1A] pb-6 sm:flex-row sm:items-end sm:justify-between"><div class="flex flex-col gap-2"><span class="block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Production integrity</span> <h1 class="text-4xl font-black tracking-tighter text-[#1A1A1A] uppercase">Failure Review</h1> <p class="max-w-3xl text-xs font-bold text-gray-500 uppercase">Level mismatches stay here until you confirm them. Confirm failure stores the interval outside OEES. Accept as valid keeps it in OEES as normal production, and review stops highlighting that part at that process.</p></div> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Search <input${attr("value", search)} class="w-64 border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-[#1A1A1A] uppercase outline-none focus:border-[#FF4F00]" placeholder="PART, PROCESS, FAMILY" name="failure-review-search"/></label></header> `);
		if (form?.message) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[11px] font-black text-red-700 uppercase">${escape_html(form.message)}</p>`);
		} else if (form?.confirmed) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="border-l-4 border-violet-600 bg-violet-50 px-4 py-3 text-[11px] font-black text-violet-800 uppercase">${escape_html(form.part)} at ${escape_html(form.process)} confirmed. ${escape_html(qty(form.moved))} intervals moved out of OEES.</p>`);
		} else if (form?.accepted) {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<p class="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-[11px] font-black text-green-800 uppercase">${escape_html(form.part)} at ${escape_html(form.process)} accepted as valid production. It stays in OEES and is no longer highlighted.</p>`);
		} else if (form?.reopened) {
			$$renderer.push("<!--[3-->");
			$$renderer.push(`<p class="border-l-4 border-orange-600 bg-orange-50 px-4 py-3 text-[11px] font-black text-orange-800 uppercase">${escape_html(form.part)} at ${escape_html(form.process)} is back in level review.</p>`);
		} else if (form?.revoked) {
			$$renderer.push("<!--[4-->");
			$$renderer.push(`<p class="border-l-4 border-orange-600 bg-orange-50 px-4 py-3 text-[11px] font-black text-orange-800 uppercase">${escape_html(form.part)} at ${escape_html(form.process)} returned to OEES. ${escape_html(qty(form.moved))} intervals restored.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <section class="space-y-3"><h2 class="text-sm font-black tracking-widest text-[#1A1A1A] uppercase">Confirmed failures · ${escape_html(qty(confirmed().length))}</h2> <div class="overflow-x-auto border border-gray-200 bg-white shadow-xl"><table class="w-full min-w-[880px] border-collapse text-left"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-wider text-white uppercase"><th class="p-3">Part</th><th class="p-3">Process</th><th class="p-3">Error</th><th class="p-3 text-right">Intervals</th><th class="p-3 text-right">Pieces</th><th class="p-3">Latest</th><th class="p-3"></th></tr></thead><tbody class="divide-y divide-gray-100 text-[11px]">`);
		const each_array = ensure_array_like(confirmed());
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let row = each_array[$$index];
				$$renderer.push(`<tr class="bg-violet-50/60"><td class="p-3 font-mono font-bold">${escape_html(row.part)}</td><td class="p-3 font-black uppercase">${escape_html(row.process)}</td><td class="p-3 font-bold text-violet-900 uppercase">${escape_html(row.error)}</td><td class="p-3 text-right font-mono">${escape_html(qty(row.intervals))}</td><td class="p-3 text-right font-mono font-bold text-violet-700">${escape_html(qty(row.qty))}</td><td class="p-3 font-mono text-gray-500">${escape_html(row.latest || "—")}</td><td class="p-3 text-right"><form method="POST" action="?/revoke"><input type="hidden" name="part"${attr("value", row.part)}/> <input type="hidden" name="process"${attr("value", row.process)}/> <button class="cursor-pointer bg-[#1A1A1A] px-3 py-2 text-[9px] font-black tracking-wider text-white uppercase hover:bg-[#FF4F00] disabled:cursor-wait disabled:bg-gray-300"${attr("disabled", pending === `revoke-${row.part}-${row.process}`, true)}>Return to OEES</button></form></td></tr>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="7" class="p-6 text-center text-[10px] font-bold text-gray-400 uppercase">No confirmed failures yet.</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></section> <section class="space-y-3"><h2 class="text-sm font-black tracking-widest text-[#1A1A1A] uppercase">Accepted as production · ${escape_html(qty(accepted().length))}</h2> <div class="overflow-x-auto border border-gray-200 bg-white shadow-xl"><table class="w-full min-w-[760px] border-collapse text-left"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-wider text-white uppercase"><th class="p-3">Part</th><th class="p-3">Process</th><th class="p-3 text-right">Intervals</th><th class="p-3 text-right">Pieces</th><th class="p-3">Latest</th><th class="p-3"></th></tr></thead><tbody class="divide-y divide-gray-100 text-[11px]">`);
		const each_array_1 = ensure_array_like(accepted());
		if (each_array_1.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let row = each_array_1[$$index_1];
				$$renderer.push(`<tr class="bg-green-50/70"><td class="p-3 font-mono font-bold">${escape_html(row.part)}</td><td class="p-3 font-black uppercase">${escape_html(row.process)}</td><td class="p-3 text-right font-mono">${escape_html(qty(row.intervals))}</td><td class="p-3 text-right font-mono font-bold text-green-800">${escape_html(qty(row.qty))}</td><td class="p-3 font-mono text-gray-500">${escape_html(row.latest || "—")}</td><td class="p-3 text-right"><form method="POST" action="?/reopen"><input type="hidden" name="part"${attr("value", row.part)}/> <input type="hidden" name="process"${attr("value", row.process)}/> <button class="cursor-pointer bg-[#1A1A1A] px-3 py-2 text-[9px] font-black tracking-wider text-white uppercase hover:bg-[#FF4F00] disabled:cursor-wait disabled:bg-gray-300"${attr("disabled", pending === `reopen-${row.part}-${row.process}`, true)}>Highlight again</button></form></td></tr>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="6" class="p-6 text-center text-[10px] font-bold text-gray-400 uppercase">No parts accepted as valid production yet.</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></section> <section class="space-y-3"><h2 class="text-sm font-black tracking-widest text-[#1A1A1A] uppercase">Needs review · ${escape_html(qty(candidates().length))}</h2> <div class="overflow-x-auto border border-gray-200 bg-white shadow-xl"><table class="w-full min-w-[1100px] border-collapse text-left"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-wider text-white uppercase"><th class="p-3">Part</th><th class="p-3">Process</th><th class="p-3">Level</th><th class="p-3">Family</th><th class="p-3 text-right">Intervals</th><th class="p-3 text-right">Pieces</th><th class="p-3">Machines</th><th class="p-3">Latest</th><th class="p-3">Error note</th></tr></thead><tbody class="divide-y divide-gray-100 text-[11px]">`);
		const each_array_2 = ensure_array_like(candidates());
		if (each_array_2.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let row = each_array_2[$$index_2];
				$$renderer.push(`<tr><td class="p-3 font-mono font-bold">${escape_html(row.part)}</td><td class="p-3 font-black uppercase">${escape_html(row.process)}</td><td class="p-3 font-bold text-violet-700 uppercase">${escape_html(row.level)} · expected ${escape_html(row.expected)}</td><td class="p-3 uppercase">${escape_html(row.family)}</td><td class="p-3 text-right font-mono">${escape_html(qty(row.intervals))}</td><td class="p-3 text-right font-mono font-bold">${escape_html(qty(row.qty))}</td><td class="p-3 font-mono text-[10px] text-gray-500"${attr("title", row.machines.join(", "))}>${escape_html(row.machines.slice(0, 3).join(", "))}${escape_html(row.machines.length > 3 ? ` +${row.machines.length - 3}` : "")}</td><td class="p-3 font-mono text-gray-500">${escape_html(row.latest || "—")}</td><td class="p-3"><form method="POST" action="?/confirm" class="flex items-center gap-2"><input type="hidden" name="part"${attr("value", row.part)}/> <input type="hidden" name="process"${attr("value", row.process)}/> <input name="error" required=""${attr("value", row.error)} placeholder="WHY THIS PART FAILS ON THIS EQUIPMENT" class="w-full min-w-64 border border-gray-300 px-2 py-2 text-[10px] font-bold uppercase outline-none focus:border-[#FF4F00]"/> <button class="shrink-0 cursor-pointer bg-violet-700 px-3 py-2 text-[9px] font-black tracking-wider text-white uppercase hover:bg-violet-900 disabled:cursor-wait disabled:bg-gray-300"${attr("disabled", pending === `confirm-${row.part}-${row.process}`, true)}>Confirm failure</button></form> <form method="POST" action="?/accept" class="mt-2"><input type="hidden" name="part"${attr("value", row.part)}/> <input type="hidden" name="process"${attr("value", row.process)}/> <button class="shrink-0 cursor-pointer border border-green-700 bg-white px-3 py-2 text-[9px] font-black tracking-wider text-green-800 uppercase hover:bg-green-50 disabled:cursor-wait disabled:bg-gray-100"${attr("disabled", pending === `accept-${row.part}-${row.process}`, true)}>Accept valid</button></form></td></tr>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="9" class="p-6 text-center text-[10px] font-bold text-gray-400 uppercase">No level mismatches waiting for review.</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></section></main></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CfMH3ruZ.js.map
