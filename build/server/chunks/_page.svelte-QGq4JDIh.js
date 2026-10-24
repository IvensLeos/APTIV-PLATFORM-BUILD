import { U as escape_html, T as attr_class, V as stringify, S as attr, a7 as ensure_array_like, a9 as clsx$1, K as derived } from './dev-Dhosxf2u.js';
import { j as formatTime12, k as toMinutes, p as parseIsoDateUTC, q as getShifts, a as getShift, t as toErpDate, s as shiftDays, i as isWeekendUTC } from './plantTime-CoBszG0i.js';
import './client-BJpSpMnO.js';
import './index-server-BJox0gTe.js';
import './internal-BtmYaD7j.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/custom-scrape/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let opDate = data.defaultDate || "";
		let selectedShift = data.currentShift || "T09";
		let selectedProcess = "";
		let processQuery = "";
		const holiday = derived(() => data.holidays?.find((item) => item.date === opDate) || null);
		const isWeekend = derived(() => {
			const date = parseIsoDateUTC(opDate);
			return date ? isWeekendUTC(date) : false;
		});
		const isSpecialDay = derived(() => isWeekend() || !!holiday());
		const shiftOptions = derived(() => getShifts(isSpecialDay()));
		const armed = derived(() => false);
		const visibleProcesses = derived(() => {
			const query = processQuery.trim().toUpperCase();
			const list = data.processes || [];
			if (!query) return list;
			return list.filter((process) => process.id.includes(query) || process.label.toUpperCase().includes(query));
		});
		const selectedProcessLabel = derived(() => {
			return data.processes?.find((process) => process.id === selectedProcess)?.label || "";
		});
		const windowPreview = derived(() => {
			const date = parseIsoDateUTC(opDate);
			const shift = getShift(selectedShift, isSpecialDay());
			if (!date || !shift) return null;
			const opDay = {
				year: date.getUTCFullYear(),
				month: date.getUTCMonth() + 1,
				day: date.getUTCDate()
			};
			const fromDate = toErpDate(opDay);
			const toDate = shift.crossesMidnight ? toErpDate(shiftDays(opDay, 1)) : fromDate;
			return {
				from: `${fromDate} ${shift.start}:00`,
				to: `${toDate} ${shift.end}:00`,
				crossesMidnight: shift.crossesMidnight,
				label: `${formatTime12(toMinutes(shift.start))} – ${formatTime12(toMinutes(shift.end))}`
			};
		});
		const scheduleNote = derived(() => {
			if (holiday()) return holiday().description ? `Holiday: ${holiday().description}. Special shift hours.` : "Holiday. Special shift hours.";
			if (isWeekend()) return "Weekend. Special shift hours.";
			return "Weekday hours.";
		});
		const resultRequest = derived(() => form?.request || null);
		const resultDetails = derived(() => form?.details || null);
		function formatLogDate(isoString) {
			if (!isoString) return "—";
			return new Date(isoString).toLocaleString("en-US", {
				timeZone: "UTC",
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit"
			});
		}
		function formatOpDate(iso) {
			const date = parseIsoDateUTC(iso);
			if (!date) return iso || "—";
			return date.toLocaleDateString("en-US", {
				timeZone: "UTC",
				weekday: "short",
				month: "short",
				day: "numeric"
			});
		}
		function shiftLabel(shift) {
			return String(shift || "").replace("_MANUAL", "").replace("_CIERRE", " close").replace("_SPECIAL", "");
		}
		function statusText(status) {
			if (status === "SUCCESS") return "Updated";
			if (status === "ERROR") return "Error";
			return "No changes";
		}
		function statusClass(status) {
			if (status === "SUCCESS") return "bg-emerald-50 text-emerald-700";
			if (status === "ERROR") return "bg-red-50 text-red-700";
			return "bg-amber-50 text-amber-700";
		}
		function statusPill($$renderer, status) {
			$$renderer.push(`<span${attr_class(`px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase ${stringify(statusClass(status))}`)}>${escape_html(statusText(status))}</span>`);
		}
		$$renderer.push(`<div class="mx-auto min-h-screen max-w-7xl bg-[#F4F4F4] p-6 font-sans"><header class="mb-6 flex flex-col justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 lg:flex-row lg:items-end"><div><span class="mb-1 block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Data extraction</span> <h1 class="text-4xl leading-none font-black tracking-tighter text-[#1A1A1A] uppercase">Custom scrape</h1> <p class="mt-2 max-w-xl text-[11px] font-bold text-gray-500 uppercase">Pull one operational day and shift from the three ERP servers. A manual run does not refresh the dashboard.</p></div> <div class="grid grid-cols-2 gap-2 sm:grid-cols-3"><div class="bg-[#1A1A1A] px-4 py-3 text-white"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Source</span> <span class="font-mono text-sm font-black">${escape_html(data.devMode ? "Dev sample" : "Live ERP")}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Servers</span> <span class="font-mono text-sm font-black">${escape_html(data.servers?.length || 0)}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Writer</span> <span${attr_class(`font-mono text-sm font-black ${stringify(data.scrapeRunning ? "text-[#FF4F00]" : "text-emerald-600")}`)}>${escape_html(data.scrapeRunning ? "Busy" : "Idle")}</span></div></div></header> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-amber-500 bg-amber-50 p-3 text-[11px] font-black tracking-wide text-amber-800 uppercase">${escape_html(data.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.devMode) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-amber-500 bg-amber-50 p-3 text-[11px] font-bold text-amber-900 uppercase">Development reads the sample HTML in static/. The window below is stored on the log, but those files are not filtered by date or process.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.scrapeRunning) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-[#FF4F00] bg-orange-50 p-3 text-[11px] font-bold text-[#1A1A1A] uppercase">Another scrape is writing OEES. This run waits in line until that one finishes.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-red-600 bg-red-50 p-3 text-[11px] font-black tracking-wide text-red-700 uppercase">${escape_html(form.error)} `);
			if (form.message) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="mt-1 block font-mono text-[10px] font-bold normal-case">${escape_html(form.message)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-1 gap-6 lg:grid-cols-3"><form method="POST" class="flex flex-col gap-5 border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2"><input type="hidden" name="shiftId"${attr("value", selectedShift)}/> <input type="hidden" name="process"${attr("value", selectedProcess)}/> <div class="grid grid-cols-1 gap-5 md:grid-cols-2"><div class="flex flex-col gap-2"><label for="op-date" class="text-[10px] font-black tracking-wider text-gray-400 uppercase">Operational day</label> <input id="op-date" type="date" name="opDate" required=""${attr("value", opDate)} class="w-full border-2 border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs font-black uppercase outline-none focus:border-[#FF4F00]"/> <span class="text-[10px] font-bold text-gray-500 uppercase">${escape_html(formatOpDate(opDate))} · ${escape_html(scheduleNote())}</span></div> <div class="flex flex-col justify-end gap-2"><button type="button" class="border-2 border-black bg-white px-3 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-black hover:text-white">Jump to current shift</button> <p class="text-[10px] font-bold text-gray-400 uppercase">Plant day starts at 06:40. Before that, today is still yesterday.</p></div></div> <fieldset class="flex flex-col gap-2"><legend class="text-[10px] font-black tracking-wider text-gray-400 uppercase">Production shift</legend> <div class="grid grid-cols-1 gap-2 sm:grid-cols-3"><!--[-->`);
		const each_array = ensure_array_like(shiftOptions());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let shift = each_array[$$index];
			const current = shift.id === data.currentShift && opDate === data.defaultDate;
			$$renderer.push(`<button type="button"${attr("aria-pressed", selectedShift === shift.id)}${attr_class(`border-2 px-3 py-3 text-left transition-colors ${stringify(selectedShift === shift.id)} ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-gray-200 bg-gray-50 text-[#1A1A1A] hover:border-[#1A1A1A]'}`)}><span class="flex items-center justify-between gap-2"><span class="text-sm font-black tracking-tight">${escape_html(shift.id)}</span> `);
			if (current) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="text-[8px] font-black tracking-widest text-[#FF4F00] uppercase">Now</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></span> <span${attr_class(`mt-1 block font-mono text-[10px] font-bold ${stringify(selectedShift === shift.id ? "text-gray-300" : "text-gray-500")}`)}>${escape_html(formatTime12(toMinutes(shift.start)))} – ${escape_html(formatTime12(toMinutes(shift.end)))}</span> `);
			if (shift.crossesMidnight) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="mt-1 block text-[8px] font-black tracking-widest text-gray-400 uppercase">Ends next morning</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></button>`);
		}
		$$renderer.push(`<!--]--></div></fieldset> <div class="flex flex-col gap-2"><div class="flex items-end justify-between gap-3"><label class="flex flex-1 flex-col gap-2" for="process-search"><span class="text-[10px] font-black tracking-wider text-gray-400 uppercase">Manufacturing process</span> <input id="process-search" type="search"${attr("value", processQuery)} placeholder="Filter by name or ERP code" class="w-full border-2 border-gray-200 bg-gray-50 px-3 py-2 text-[10px] font-black uppercase outline-none placeholder:text-gray-400 focus:border-[#FF4F00]"/></label> <span class="pb-2 font-mono text-[10px] font-black text-gray-400 uppercase">${escape_html("None selected")}</span></div> <div class="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto border-2 border-gray-100 p-1 sm:grid-cols-2"><button type="button"${attr("aria-pressed", selectedProcess === "ALL")}${attr_class(`border px-3 py-2 text-left sm:col-span-2 ${stringify(selectedProcess === "ALL")} ? 'border-[#FF4F00] bg-[#1A1A1A] text-white' : 'border-transparent bg-gray-50 hover:border-gray-300'}`)}><span class="block text-[11px] font-black uppercase">All processes</span> <span class="font-mono text-[9px] font-bold text-gray-400">Every ERP process on the three hosts</span></button> `);
		const each_array_1 = ensure_array_like(visibleProcesses());
		if (each_array_1.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let process = each_array_1[$$index_1];
				$$renderer.push(`<button type="button"${attr("aria-pressed", selectedProcess === process.id)}${attr_class(`border px-3 py-2 text-left ${stringify(selectedProcess === process.id)} ? 'border-[#FF4F00] bg-[#1A1A1A] text-white' : 'border-transparent bg-white hover:border-gray-300'}`)}><span class="block text-[11px] font-black uppercase">${escape_html(process.label)}</span> <span${attr_class(`font-mono text-[9px] font-bold ${stringify(selectedProcess === process.id ? "text-gray-400" : "text-zinc-500")}`)}>${escape_html(process.id)}</span></button>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<p class="px-3 py-6 text-center text-[10px] font-bold text-gray-400 uppercase sm:col-span-2">No process matches that filter.</p>`);
		}
		$$renderer.push(`<!--]--></div></div> `);
		if (windowPreview()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="border-2 border-gray-100 bg-gray-50 px-4 py-3"><span class="text-[9px] font-black tracking-widest text-gray-400 uppercase">ERP window</span> <p class="mt-1 font-mono text-sm font-black text-[#1A1A1A]">${escape_html(windowPreview().from)} → ${escape_html(windowPreview().to)}</p> <p class="mt-1 text-[10px] font-bold text-gray-500 uppercase">${escape_html(selectedShift)} · ${escape_html(windowPreview().label)} `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (windowPreview().crossesMidnight) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`· Operational day stays ${escape_html(formatOpDate(opDate))}`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (armed() && windowPreview()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="border-2 border-[#FF4F00] bg-orange-50 px-4 py-3 text-[11px] font-bold text-[#1A1A1A] uppercase">This writes OEES for ${escape_html(selectedProcessLabel())} on ${escape_html(formatOpDate(opDate))}, ${escape_html(windowPreview().from)} → ${escape_html(windowPreview().to)}.
                    Press run to send it.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", true, true)}${attr_class(`w-full py-3 text-[11px] font-black tracking-widest text-white uppercase shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 ${stringify(armed() ? "bg-[#FF4F00] hover:bg-[#1A1A1A]" : "bg-[#1A1A1A] hover:bg-[#FF4F00]")}`)}>`);
		$$renderer.push("<!--[1-->");
		$$renderer.push(`Select a process`);
		$$renderer.push(`<!--]--></button></form> <aside class="flex flex-col border border-gray-200 bg-white p-5 shadow-sm"><h2 class="mb-4 border-b-2 border-gray-100 pb-2 text-xs font-black text-[#1A1A1A] uppercase">Last result</h2> `);
		if (form?.success && resultDetails()) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="mb-4 border-l-4 border-emerald-600 bg-emerald-50 p-3 text-[10px] font-black text-emerald-700 uppercase">Extraction finished</div> `);
			if (resultRequest()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mb-4 font-mono text-[10px] font-bold text-gray-500 uppercase">${escape_html(resultRequest().process)} · ${escape_html(resultRequest().shiftId)} · ${escape_html(resultRequest().from)} → ${escape_html(resultRequest().to)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <dl class="flex flex-col gap-3"><div class="flex items-baseline justify-between border-b border-gray-100 pb-2"><dt class="text-[10px] font-black text-gray-400 uppercase">Intervals prepared</dt> <dd class="font-mono text-sm font-black">${escape_html(resultDetails().intervals)}</dd></div> <div class="flex items-baseline justify-between border-b border-gray-100 pb-2"><dt class="text-[10px] font-black text-gray-400 uppercase">Inserted</dt> <dd class="font-mono text-sm font-black text-blue-600">${escape_html(resultDetails().upserted)}</dd></div> <div class="flex items-baseline justify-between border-b border-gray-100 pb-2"><dt class="text-[10px] font-black text-gray-400 uppercase">Updated</dt> <dd class="font-mono text-sm font-black text-gray-700">${escape_html(resultDetails().modified)}</dd></div></dl> <div class="mt-4"><span class="mb-2 block text-[8px] font-black tracking-widest text-gray-400 uppercase">Host breakdown</span> <!--[-->`);
			const each_array_2 = ensure_array_like(form.summary || []);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let server = each_array_2[$$index_2];
				$$renderer.push(`<div class="flex items-center justify-between gap-2 border-b border-gray-50 py-1.5 text-[10px]"><span class="font-black">${escape_html(server.server)}</span> <span class="flex items-center gap-2"><span class="font-mono font-bold text-gray-500">${escape_html(server.records)}</span> `);
				statusPill($$renderer, server.status);
				$$renderer.push(`<!----></span></div> `);
				if (server.status === "ERROR" && server.message) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="pb-1 font-mono text-[9px] font-bold text-red-600 normal-case">${escape_html(server.message)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else if (form?.summary?.length) {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<div class="mb-3 border-l-4 border-red-600 bg-red-50 p-3 text-[10px] font-black text-red-700 uppercase">Nothing was confirmed</div> <!--[-->`);
			const each_array_3 = ensure_array_like(form.summary);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let server = each_array_3[$$index_3];
				$$renderer.push(`<div class="flex items-center justify-between gap-2 border-b border-gray-50 py-1.5 text-[10px]"><span class="font-black">${escape_html(server.server)}</span> `);
				statusPill($$renderer, server.status);
				$$renderer.push(`<!----></div> `);
				if (server.message) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="pb-1 font-mono text-[9px] font-bold text-red-600 normal-case">${escape_html(server.message)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="flex flex-1 flex-col justify-center py-8"><p class="text-[11px] font-black text-[#1A1A1A] uppercase">Ready</p> <p class="mt-2 text-[10px] font-bold text-gray-400 uppercase">Pick the day, the shift, and one process. Review shows the exact MANTIS window before anything is written.</p> <ul class="mt-4 flex flex-col gap-1"><!--[-->`);
			const each_array_4 = ensure_array_like(data.servers || []);
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let server = each_array_4[$$index_4];
				$$renderer.push(`<li class="font-mono text-[10px] font-black text-gray-500">${escape_html(server)}</li>`);
			}
			$$renderer.push(`<!--]--></ul></div>`);
		}
		$$renderer.push(`<!--]--></aside></div> <section class="mt-6 border border-gray-200 bg-white shadow-sm"><div class="flex items-end justify-between gap-3 border-b border-gray-100 px-5 py-4"><div><h2 class="text-xs font-black text-[#1A1A1A] uppercase">Recent runs</h2> <p class="mt-1 text-[10px] font-bold text-gray-400 uppercase">Plant time. Each row is one scrape across the three servers.</p></div> <a href="/admin/scrapelogs" class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase hover:underline">Open scrape logs</a></div> `);
		if (data.recentRuns?.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<ul><!--[-->`);
			const each_array_5 = ensure_array_like(data.recentRuns);
			for (let $$index_6 = 0, $$length = each_array_5.length; $$index_6 < $$length; $$index_6++) {
				let run = each_array_5[$$index_6];
				$$renderer.push(`<li class="grid grid-cols-1 gap-2 border-b border-gray-50 px-5 py-3 last:border-b-0 md:grid-cols-[9rem_5rem_6rem_1fr_auto] md:items-center"><span class="font-mono text-[11px] font-black">${escape_html(formatLogDate(run.timestamp))}</span> <span class="text-[10px] font-black tracking-widest text-gray-500 uppercase">${escape_html(run.origin)}</span> <span class="font-mono text-[11px] font-black">${escape_html(shiftLabel(run.shift))}</span> <span class="flex flex-wrap gap-x-3 gap-y-1"><!--[-->`);
				const each_array_6 = ensure_array_like(run.servers);
				for (let $$index_5 = 0, $$length = each_array_6.length; $$index_5 < $$length; $$index_5++) {
					let server = each_array_6[$$index_5];
					$$renderer.push(`<span class="font-mono text-[10px] font-bold text-gray-500">${escape_html(server.server)} <span${attr_class(clsx$1(server.status === "ERROR" ? "text-red-600" : server.status === "SUCCESS" ? "text-emerald-600" : "text-amber-600"))}>${escape_html(server.records)}</span></span>`);
				}
				$$renderer.push(`<!--]--></span> <span class="justify-self-start md:justify-self-end">`);
				statusPill($$renderer, run.status);
				$$renderer.push(`<!----></span></li>`);
			}
			$$renderer.push(`<!--]--></ul>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="px-5 py-8 text-center text-[10px] font-bold text-gray-400 uppercase">No scrape logs yet.</p>`);
		}
		$$renderer.push(`<!--]--></section></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Custom Scraper Console</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-QGq4JDIh.js.map
