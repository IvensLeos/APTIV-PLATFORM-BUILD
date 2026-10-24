import { U as escape_html, T as attr_class, V as stringify, S as attr, a7 as ensure_array_like, K as derived } from './dev-Dhosxf2u.js';
import { p as page } from './state-CzwUy4yh.js';
import './client-BJpSpMnO.js';
import './index-server-BJox0gTe.js';
import './internal-BtmYaD7j.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/scrapelogs/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const logs = derived(() => data.logs || []);
		let searchTerm = "";
		let statusFilter = "ALL";
		let originFilter = "ALL";
		let openRuns = {};
		const runs = derived(() => {
			const groups = /* @__PURE__ */ new Map();
			for (const log of logs()) {
				const key = `${log.timestamp}|${log.origin}|${log.shift}`;
				if (!groups.has(key)) groups.set(key, {
					id: key,
					timestamp: log.timestamp,
					origin: log.origin,
					shift: log.shift,
					servers: []
				});
				groups.get(key).servers.push(log);
			}
			return [...groups.values()].map((run) => {
				const records = run.servers.reduce((sum, server) => sum + server.records, 0);
				const upserted = run.servers.reduce((sum, server) => sum + server.details.upserted, 0);
				const modified = run.servers.reduce((sum, server) => sum + server.details.modified, 0);
				const status = run.servers.some((server) => server.status === "ERROR") ? "ERROR" : run.servers.some((server) => server.status === "SUCCESS") ? "SUCCESS" : "PENDING";
				return {
					...run,
					records,
					upserted,
					modified,
					status
				};
			});
		});
		const filteredRuns = derived(() => {
			const term = searchTerm.trim().toUpperCase();
			return runs().filter((run) => {
				if (!term) return true;
				return [
					run.shift,
					run.origin,
					run.status,
					shiftLabel(run.shift),
					...run.servers.flatMap((server) => [
						server.server,
						server.message,
						server.status
					])
				].join(" ").toUpperCase().includes(term);
			});
		});
		const summary = derived(() => {
			return {
				errors: filteredRuns().filter((run) => run.status === "ERROR").length,
				pending: filteredRuns().filter((run) => run.status === "PENDING").length,
				success: filteredRuns().filter((run) => run.status === "SUCCESS").length,
				lastCron: runs().find((run) => run.origin === "CRON"),
				lastManual: runs().find((run) => run.origin === "MANUAL"),
				shown: filteredRuns().length
			};
		});
		function queryHref(extra) {
			const url = new URL(page.url);
			for (const [key, value] of Object.entries(extra)) if (!value || value === "ALL" || value === "48h") url.searchParams.delete(key);
			else url.searchParams.set(key, value);
			return `${url.pathname}${url.search}`;
		}
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
		function shiftLabel(shift) {
			const name = String(shift || "");
			if (name.endsWith("_CIERRE")) return `${name.replace("_CIERRE", "")} close`;
			if (name.endsWith("_MANUAL")) return name.replace("_MANUAL", "");
			return name;
		}
		function statusLabel(status) {
			if (status === "SUCCESS") return "Updated";
			if (status === "ERROR") return "Error";
			return "No changes";
		}
		$$renderer.push(`<div class="mx-auto min-h-screen max-w-7xl bg-[#F4F4F4] p-6 font-sans"><header class="mb-6 flex flex-col justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 lg:flex-row lg:items-end"><div><span class="mb-1 block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Scrape audit</span> <h1 class="text-4xl leading-none font-black tracking-tighter text-[#1A1A1A] uppercase">Scrape logs</h1> <p class="mt-2 text-[11px] font-bold text-gray-500 uppercase">Each row is one scrape. The three ERP servers are inside it. Times are plant time.</p></div> <div class="grid grid-cols-2 gap-2 sm:grid-cols-4"><div class="bg-[#1A1A1A] px-4 py-3 text-white"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Showing</span> <span class="font-mono text-lg font-black">${escape_html(summary().shown)}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Updated</span> <span class="font-mono text-lg font-black text-emerald-600">${escape_html(summary().success)}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">No changes</span> <span class="font-mono text-lg font-black text-amber-600">${escape_html(summary().pending)}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Errors</span> <span${attr_class(`font-mono text-lg font-black ${stringify(summary().errors ? "text-red-600" : "text-gray-400")}`)}>${escape_html(summary().errors)}</span></div></div></header> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-6 border-2 border-red-600 bg-red-50 p-4 text-[11px] font-black tracking-widest text-red-700 uppercase">${escape_html(data.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <section class="mb-4 grid gap-3 border bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]"><label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Search <input type="search"${attr("value", searchTerm)} placeholder="Server, shift, message" class="border-2 border-black bg-white px-2 py-1.5 text-[10px] font-black text-zinc-900 uppercase outline-none placeholder:text-gray-400"/></label> <div class="flex flex-wrap items-end gap-4"><div class="flex flex-col gap-1"><span class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Window</span> <div class="flex gap-1"><!--[-->`);
		const each_array = ensure_array_like([
			["24h", "24h"],
			["48h", "48h"],
			["7d", "7 days"]
		]);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [id, label] = each_array[$$index];
			$$renderer.push(`<a${attr("href", queryHref({ range: id }))}${attr_class(`border-2 px-3 py-1.5 text-[10px] font-black uppercase ${stringify(data.range === id ? "border-black bg-black text-white" : "border-zinc-200 bg-white text-zinc-400")}`)}>${escape_html(label)}</a>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="flex flex-col gap-1"><span class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Server</span> <div class="flex flex-wrap gap-1"><!--[-->`);
		const each_array_1 = ensure_array_like([
			"ALL",
			"REMAN61A",
			"REMAN65",
			"REDBC001"
		]);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let node = each_array_1[$$index_1];
			$$renderer.push(`<a${attr("href", queryHref({ server: node }))}${attr_class(`border-2 px-3 py-1.5 text-[10px] font-black uppercase ${stringify(data.currentFilter === node ? "border-black bg-black text-white" : "border-zinc-200 bg-white text-zinc-400")}`)}>${escape_html(node)}</a>`);
		}
		$$renderer.push(`<!--]--></div></div></div></section> <section class="mb-4 flex flex-wrap gap-2"><!--[-->`);
		const each_array_2 = ensure_array_like([
			["ALL", "All statuses"],
			["SUCCESS", "Updated"],
			["PENDING", "No changes"],
			["ERROR", "Errors"]
		]);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let [id, label] = each_array_2[$$index_2];
			$$renderer.push(`<button type="button"${attr_class(`border-2 px-3 py-1.5 text-[10px] font-black uppercase ${stringify(statusFilter === id ? "border-black bg-black text-white" : "border-zinc-200 bg-white text-zinc-400")}`)}>${escape_html(label)}</button>`);
		}
		$$renderer.push(`<!--]--> <span class="mx-1 w-px bg-zinc-200"></span> <!--[-->`);
		const each_array_3 = ensure_array_like([
			["ALL", "All sources"],
			["CRON", "Cron"],
			["MANUAL", "Manual"]
		]);
		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let [id, label] = each_array_3[$$index_3];
			$$renderer.push(`<button type="button"${attr_class(`border-2 px-3 py-1.5 text-[10px] font-black uppercase ${stringify(originFilter === id ? "border-[#FF4F00] bg-[#FF4F00] text-white" : "border-zinc-200 bg-white text-zinc-400")}`)}>${escape_html(label)}</button>`);
		}
		$$renderer.push(`<!--]--></section> `);
		if (summary().lastCron || summary().lastManual) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="mb-4 text-[10px] font-bold tracking-widest text-gray-500 uppercase">`);
			if (summary().lastCron) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`Last cron ${escape_html(formatLogDate(summary().lastCron.timestamp))}`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (summary().lastCron && summary().lastManual) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="mx-2 text-gray-300">·</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (summary().lastManual) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`Last manual ${escape_html(formatLogDate(summary().lastManual.timestamp))}`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="overflow-x-auto border bg-white shadow-sm"><table class="w-full border-collapse text-left"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-wider text-white uppercase"><th class="px-3 py-2">When</th><th class="px-3 py-2">Source</th><th class="px-3 py-2">Shift</th><th class="px-3 py-2">Result</th><th class="px-3 py-2 text-right">Records</th><th class="px-3 py-2 text-right">New</th><th class="px-3 py-2 text-right">Updated</th><th class="px-3 py-2">Servers</th></tr></thead><tbody>`);
		const each_array_4 = ensure_array_like(filteredRuns());
		if (each_array_4.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
				let run = each_array_4[$$index_5];
				$$renderer.push(`<tr${attr_class(`border-b border-zinc-100 text-[11px] ${stringify(run.status === "ERROR" ? "bg-red-50" : "")}`)}><td class="px-3 py-2 font-mono font-black whitespace-nowrap">${escape_html(formatLogDate(run.timestamp))}</td><td class="px-3 py-2"><span${attr_class(`px-1.5 py-0.5 text-[9px] font-black uppercase ${stringify(run.origin === "MANUAL" ? "bg-[#FF4F00] text-white" : "bg-zinc-900 text-white")}`)}>${escape_html(run.origin === "MANUAL" ? "Manual" : "Cron")}</span></td><td class="px-3 py-2 font-black uppercase">${escape_html(shiftLabel(run.shift))}</td><td class="px-3 py-2"><span${attr_class(`px-1.5 py-0.5 text-[9px] font-black uppercase ${stringify(run.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700" : run.status === "ERROR" ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700")}`)}>${escape_html(statusLabel(run.status))}</span></td><td class="px-3 py-2 text-right font-mono font-black tabular-nums">${escape_html(run.records.toLocaleString("en-US"))}</td><td class="px-3 py-2 text-right font-mono tabular-nums text-emerald-700">${escape_html(run.upserted.toLocaleString("en-US"))}</td><td class="px-3 py-2 text-right font-mono tabular-nums text-sky-700">${escape_html(run.modified.toLocaleString("en-US"))}</td><td class="px-3 py-2"><button type="button" class="text-left text-[10px] font-black uppercase"><span class="mr-1 text-[8px]">${escape_html(openRuns[run.id] ? "▼" : "▶")}</span> ${escape_html(run.servers.map((server) => server.server).join(" · "))}</button></td></tr> `);
				if (openRuns[run.id]) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<!--[-->`);
					const each_array_5 = ensure_array_like(run.servers);
					for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
						let server = each_array_5[$$index_4];
						$$renderer.push(`<tr class="border-b border-zinc-50 bg-zinc-50 text-[10px]"><td${attr_class(`py-2 pr-3 pl-8 font-black uppercase ${stringify(server.status === "ERROR" ? "text-red-700" : "")}`)}>${escape_html(server.server)}</td><td></td><td></td><td class="px-3 py-2 font-black uppercase">${escape_html(statusLabel(server.status))}</td><td class="px-3 py-2 text-right font-mono tabular-nums">${escape_html(server.records.toLocaleString("en-US"))}</td><td class="px-3 py-2 text-right font-mono tabular-nums">${escape_html(server.details.upserted.toLocaleString("en-US"))}</td><td class="px-3 py-2 text-right font-mono tabular-nums">${escape_html(server.details.modified.toLocaleString("en-US"))}</td><td class="px-3 py-2 text-zinc-500">${escape_html(server.message || "Synchronization finished.")}</td></tr>`);
					}
					$$renderer.push(`<!--]-->`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="8" class="px-3 py-10 text-center text-[11px] font-black tracking-widest text-gray-400 uppercase">No scrapes in this window</td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-bgDmS8Vp.js.map
