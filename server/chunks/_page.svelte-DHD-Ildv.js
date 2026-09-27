import { S as attr, a6 as ensure_array_like, U as escape_html, K as derived } from './dev-BeB9xBTu.js';
import './client-BvSdefav.js';
import './index-server-D1jVuM2R.js';
import './internal-BsbvprU4.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/custom-scrape/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let isLoading = false;
		let selectedProcess = "";
		let selectedShift = "T09";
		let opDate = "";
		let isWeekend = derived(() => {
			return false;
		});
		let shiftOptions = derived(() => {
			if (!isWeekend()) return [
				{
					id: "T09",
					label: "SHIFT 09 (06:40 AM - 04:10 PM)",
					from: "06:40",
					to: "16:10"
				},
				{
					id: "T25",
					label: "SHIFT 25 (04:10 PM - 10:16 PM)",
					from: "16:10",
					to: "22:16"
				},
				{
					id: "T08",
					label: "SHIFT 08 (10:16 PM - 06:40 AM)",
					from: "22:16",
					to: "06:40"
				}
			];
			else return [
				{
					id: "T09",
					label: "SHIFT 09 WEEKEND (06:40 AM - 02:40 PM)",
					from: "06:40",
					to: "14:40"
				},
				{
					id: "T25",
					label: "SHIFT 25 WEEKEND (02:40 PM - 10:40 PM)",
					from: "14:40",
					to: "22:40"
				},
				{
					id: "T08",
					label: "SHIFT 08 WEEKEND (10:40 PM - 06:40 AM)",
					from: "22:40",
					to: "06:40"
				}
			];
		});
		$$renderer.push(`<div class="flex min-h-screen bg-[#F4F4F4] p-8"><main class="max-w-4xl mx-auto w-full"><header class="flex flex-col gap-2 border-b-4 border-[#1A1A1A] pb-6 mb-8"><span class="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest block">Data Extraction Tools</span> <h1 class="text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">Custom Scraper Console</h1> <p class="text-xs text-gray-500 font-bold uppercase">Manual and on-demand scraping engine for process consolidation.</p></header> <div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div class="md:col-span-2 bg-white border border-gray-200 p-6 shadow-xl flex flex-col justify-between"><form method="POST" class="flex flex-col gap-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="flex flex-col gap-2"><span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Operational Day</span> <input type="date" name="opDate" required=""${attr("value", opDate)} class="w-full bg-gray-50 border-2 border-gray-200 px-4 py-2 text-xs font-black uppercase outline-none focus:border-[#FF4F00] transition-colors"/></div> <div class="flex flex-col gap-2"><span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Production Shift</span> `);
		$$renderer.select({
			name: "shiftId",
			value: selectedShift,
			class: "w-full bg-gray-50 border-2 border-gray-200 px-4 py-2 text-xs font-black uppercase outline-none focus:border-[#FF4F00] transition-colors"
		}, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(shiftOptions());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let s = each_array[$$index];
				$$renderer.option({ value: s.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(s.label)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div></div> <div class="flex flex-col gap-2"><span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Manufacturing Area</span> `);
		$$renderer.select({
			name: "process",
			value: selectedProcess,
			required: true,
			class: "w-full bg-gray-50 border-2 border-gray-200 px-4 py-2 text-xs font-black uppercase outline-none focus:border-[#FF4F00] transition-colors"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`-- SELECT AREA / PROCESS --`);
			});
			$$renderer.option({ value: "ALL" }, ($$renderer) => {
				$$renderer.push(`ALL PROCESSES`);
			});
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(data.processes);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let process = each_array_1[$$index_1];
				$$renderer.option({ value: process }, ($$renderer) => {
					$$renderer.push(`${escape_html(process)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> <button type="submit"${attr("disabled", isLoading, true)} class="w-full mt-2 bg-[#1A1A1A] hover:bg-[#FF4F00] disabled:bg-gray-300 text-white text-[11px] font-black uppercase tracking-widest py-3 shadow-md transition-all active:scale-95 disabled:cursor-not-allowed">${escape_html("START EXTRACTION NOW")}</button></form></div> <div class="bg-white border border-gray-200 p-6 shadow-xl flex flex-col justify-between"><div><h3 class="text-xs font-black uppercase text-[#1A1A1A] mb-4 border-b-2 border-gray-100 pb-2">Scraper Status</h3> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="p-3 bg-red-50 border-l-4 border-red-600 text-red-600 font-bold text-[10px] uppercase mb-4">Error: ${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.success) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="p-3 bg-green-50 border-l-4 border-green-600 text-green-700 font-bold text-[10px] uppercase mb-4">Data Extraction Complete</div> <div class="flex flex-col gap-3"><div class="flex justify-between border-b border-gray-100 pb-2"><span class="text-[10px] font-black text-gray-400 uppercase">Records Found</span> <span class="text-sm font-black text-[#1A1A1A] font-mono">${escape_html(form.details.upserted + form.details.modified)}</span></div> <div class="flex justify-between border-b border-gray-100 pb-2"><span class="text-[10px] font-black text-gray-400 uppercase">New Upserted</span> <span class="text-sm font-black text-blue-600 font-mono">${escape_html(form.details.upserted)}</span></div> <div class="flex justify-between border-b border-gray-100 pb-2"><span class="text-[10px] font-black text-gray-400 uppercase">Existing Updated</span> <span class="text-sm font-black text-gray-700 font-mono">${escape_html(form.details.modified)}</span></div> <div class="mt-4"><span class="text-[8px] font-black text-gray-400 uppercase block mb-2">Host Breakdown</span> `);
			if (form?.summary) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<!--[-->`);
				const each_array_2 = ensure_array_like(form.summary);
				for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
					let s = each_array_2[i];
					$$renderer.push(`<div class="flex justify-between items-center text-[10px] py-1 border-b border-gray-50"><span class="font-black">${escape_html(s.server || "UNKNOWN HOST")}</span> `);
					if (s.status === "SUCCESS") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-green-600 font-black">SUCCESS (${escape_html(s.records)})</span>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<span class="text-red-600 font-black"${attr("title", s.message)}>ERROR</span>`);
					}
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="text-[10px] font-bold text-gray-400 uppercase italic text-center py-12">Select date ranges to test raw connections.</p>`);
		}
		$$renderer.push(`<!--]--></div></div></div></main></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Custom Scraper Console</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DHD-Ildv.js.map
