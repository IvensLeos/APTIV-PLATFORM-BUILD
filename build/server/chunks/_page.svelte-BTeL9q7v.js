import { a4 as escape_html, a2 as attr, a5 as attr_class, a6 as clsx$1, a8 as attr_style, a3 as stringify, a7 as ensure_array_like, X as derived } from './dev-yuvcodp0.js';
import { P as PLANT_TZ } from './shifts-BgDnDx82.js';
import './client-Cf40yDp0.js';
import './internal-Buxfpfso.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/health/+page.svelte
function summaryTile($$renderer, label, value, tone) {
	$$renderer.push(`<div${attr_class(clsx$1(["min-w-0 px-4 py-3", {
		"bg-[#1A1A1A] text-white": tone === "dark",
		"bg-red-700 text-white": tone === "alert",
		"border border-gray-200 bg-white": tone === "plain" || tone === "warn" || tone === "ok"
	}]))}><span${attr_class(clsx$1(["block text-[8px] font-bold tracking-wider uppercase", tone === "dark" || tone === "alert" ? "text-gray-300" : "text-gray-400"]))}>${escape_html(label)}</span> <span${attr_class(clsx$1(["font-mono text-lg font-black whitespace-nowrap", {
		"text-white": tone === "dark" || tone === "alert",
		"text-emerald-600": tone === "ok",
		"text-[#FF4F00]": tone === "warn",
		"text-[#1A1A1A]": tone === "plain"
	}]))}>${escape_html(value)}</span></div>`);
}
function metric($$renderer, label, value) {
	$$renderer.push(`<div class="flex items-baseline justify-between gap-4 border-b border-gray-100 py-2"><span class="text-[10px] font-black tracking-wider text-gray-400 uppercase">${escape_html(label)}</span> <span class="truncate font-mono text-xs font-black text-[#1A1A1A]"${attr("title", value)}>${escape_html(value)}</span></div>`);
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let isRefreshing = false;
		const health = derived(() => data.health);
		const online = derived(() => health().status === "ONLINE");
		const open = derived(() => health().pool.current);
		const slotsLeft = derived(() => health().pool.available);
		const busy = derived(() => health().pool.active);
		const openedSinceStart = derived(() => health().pool.totalCreated);
		const capacity = derived(() => open() + slotsLeft());
		const busyShare = derived(() => open() > 0 ? Math.round(busy() / open() * 100) : 0);
		const capacityShare = derived(() => capacity() > 0 ? open() / capacity() * 100 : 0);
		const commands = derived(() => {
			const rows = [
				{
					label: "Reads",
					count: health().ops.query,
					bar: "bg-[#1A1A1A]"
				},
				{
					label: "Inserts",
					count: health().ops.insert,
					bar: "bg-emerald-600"
				},
				{
					label: "Updates",
					count: health().ops.update,
					bar: "bg-amber-500"
				},
				{
					label: "Deletes",
					count: health().ops.delete,
					bar: "bg-red-600"
				}
			];
			const total = rows.reduce((sum, row) => sum + row.count, 0);
			const writes = health().ops.insert + health().ops.update + health().ops.delete;
			return {
				total,
				writeShare: total > 0 ? Math.round(writes / total * 100) : 0,
				rows: rows.map((row) => ({
					...row,
					share: total > 0 ? row.count / total * 100 : 0
				}))
			};
		});
		const connectionReading = derived(() => {
			if (!online()) return "The engine did not answer, so the counters below are empty.";
			if (busyShare() >= 80) return "Most open connections are running a command.";
			if (capacityShare() >= 80) return "Open connections are using most of the slots MongoDB will accept.";
			return "Most open connections are idle, and the pool still has room.";
		});
		const statusClasses = derived(() => online() ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700");
		const meterClasses = derived(() => busyShare() >= 80 ? "bg-[#FF4F00]" : "bg-[#1A1A1A]");
		const busyValueClasses = derived(() => busyShare() >= 80 ? "text-[#FF4F00]" : "text-[#1A1A1A]");
		function formatCount(value) {
			return Number(value || 0).toLocaleString("en-US");
		}
		function formatShare(share) {
			if (share > 0 && share < .1) return "<0.1%";
			if (share < 10) return `${share.toFixed(1)}%`;
			return `${Math.round(share)}%`;
		}
		function formatUptime(seconds) {
			const total = Number(seconds) || 0;
			const days = Math.floor(total / 86400);
			const hours = Math.floor(total % 86400 / 3600);
			const minutes = Math.floor(total % 3600 / 60);
			if (days > 0) return `${days}d ${hours}h`;
			if (hours > 0) return `${hours}h ${minutes}m`;
			return `${minutes}m`;
		}
		function formatCheckedAt(iso) {
			if (!iso) return "—";
			return new Date(iso).toLocaleString("en-US", {
				timeZone: PLANT_TZ,
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				second: "2-digit"
			});
		}
		$$renderer.push(`<div class="mx-auto max-w-7xl bg-[#F4F4F4] p-6 font-sans"><header class="mb-6 flex flex-col justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 lg:flex-row lg:items-end"><div class="max-w-xl"><span class="mb-1 block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Infrastructure</span> <h1 class="text-4xl leading-none font-black tracking-tighter text-[#1A1A1A] uppercase">Database health</h1> <p class="mt-2 text-[11px] font-bold text-gray-500 uppercase">Live MongoDB snapshot. The operating date in the bar does not filter this page.</p></div> <div class="flex flex-col gap-3 sm:items-end"><div class="grid grid-cols-2 gap-2 sm:grid-cols-4">`);
		summaryTile($$renderer, "Engine", health().status, online() ? "dark" : "alert");
		$$renderer.push(`<!----> `);
		summaryTile($$renderer, "Open", formatCount(open()), "plain");
		$$renderer.push(`<!----> `);
		summaryTile($$renderer, "Busy", formatCount(busy()), busyShare() >= 80 ? "warn" : "plain");
		$$renderer.push(`<!----> `);
		summaryTile($$renderer, "Memory", `${formatCount(health().memory.resident)} MB`, "plain");
		$$renderer.push(`<!----></div> <div class="flex flex-wrap items-center gap-3 sm:justify-end"><span class="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Read ${escape_html(formatCheckedAt(health().checkedAt))} · plant time</span> <form method="POST" action="?/refresh"><button type="submit"${attr("disabled", isRefreshing, true)} class="cursor-pointer bg-[#1A1A1A] px-5 py-2.5 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-[#FF4F00] disabled:cursor-not-allowed disabled:bg-gray-300">${escape_html("Refresh snapshot")}</button></form></div></div></header> `);
		if (!online()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-6 border-2 border-red-600 bg-red-50 p-4 text-[11px] font-black tracking-widest text-red-700 uppercase">Database disconnected: ${escape_html(health().error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid gap-4 lg:grid-cols-5"><section class="border border-gray-200 bg-white p-6 shadow-sm lg:col-span-3"><div class="mb-4 flex items-center justify-between border-b-2 border-gray-100 pb-2"><h2 class="text-xs font-black tracking-wider text-[#1A1A1A] uppercase">Connections</h2> <span${attr_class(clsx$1(["px-2 py-0.5 text-[9px] font-black tracking-wider", statusClasses()]))}>${escape_html(health().status)}</span></div> <div class="mb-1 flex items-baseline justify-between gap-4"><span class="font-mono text-5xl font-black tracking-tighter text-[#1A1A1A]">${escape_html(formatCount(open()))}</span> <span class="text-[9px] font-black tracking-wider text-gray-400 uppercase">Open now</span></div> <p class="mb-4 text-[11px] font-bold text-gray-500"><span${attr_class(clsx$1(["font-mono font-black", busyValueClasses()]))}>${escape_html(formatCount(busy()))}</span> busy · ${escape_html(busyShare())}% of the open connections</p> <div class="mb-2 h-3 w-full border border-gray-200 bg-gray-100" role="meter" aria-valuemin="0" aria-valuemax="100"${attr("aria-valuenow", busyShare())} aria-label="Busy share of open connections"><div${attr_class(clsx$1(["h-full transition-all duration-500", meterClasses()]))}${attr_style("", { width: `${stringify(busyShare())}%` })}></div></div> <p class="mb-5 text-[9px] font-black tracking-wider text-gray-400 uppercase">Busy share of open connections</p> `);
		metric($$renderer, "Open connections", formatCount(open()));
		$$renderer.push(`<!----> `);
		metric($$renderer, "Busy right now", formatCount(busy()));
		$$renderer.push(`<!----> `);
		metric($$renderer, "Slots still available", formatCount(slotsLeft()));
		$$renderer.push(`<!----> `);
		metric($$renderer, "Opened since start", formatCount(openedSinceStart()));
		$$renderer.push(`<!----> <p class="mt-4 text-[11px] leading-relaxed font-bold text-gray-500">${escape_html(connectionReading())}</p></section> <section class="border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2"><h2 class="mb-4 border-b-2 border-gray-100 pb-2 text-xs font-black tracking-wider text-[#1A1A1A] uppercase">Engine</h2> <div class="mb-6 flex items-baseline justify-between gap-4"><span class="font-mono text-4xl font-black tracking-tighter text-[#1A1A1A]">${escape_html(formatUptime(health().uptimeSeconds))}</span> <span class="text-[9px] font-black tracking-wider text-gray-400 uppercase">Uptime</span></div> `);
		metric($$renderer, "Physical memory", `${formatCount(health().memory.resident)} MB`);
		$$renderer.push(`<!----> `);
		metric($$renderer, "Virtual memory", `${formatCount(health().memory.virtual)} MB`);
		$$renderer.push(`<!----> `);
		metric($$renderer, "MongoDB", health().version || "Unknown");
		$$renderer.push(`<!----> `);
		metric($$renderer, "Host", health().host || "Unknown");
		$$renderer.push(`<!----> `);
		metric($$renderer, "Process", String(health().pid ?? "N/A"));
		$$renderer.push(`<!----> <p class="mt-4 text-[11px] leading-relaxed font-bold text-gray-500">Physical memory is the RAM mongod is holding. Command counters below reset only when this process restarts.</p></section></div> <section class="mt-4 border border-gray-200 bg-white p-6 shadow-sm"><div class="mb-5 flex flex-col justify-between gap-2 border-b-2 border-gray-100 pb-2 sm:flex-row sm:items-end"><div><h2 class="text-xs font-black tracking-wider text-[#1A1A1A] uppercase">Commands since start</h2> <p class="mt-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">${escape_html(formatCount(commands().total))} total · ${escape_html(commands().writeShare)}% writes</p></div> <p class="max-w-md text-[11px] font-bold text-gray-500">Inserts and updates come from the scraper. Reads come from dashboards and review. This mix is since the engine started, not the operating day.</p></div> <div class="grid gap-4 md:grid-cols-2"><!--[-->`);
		const each_array = ensure_array_like(commands().rows);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let row = each_array[$$index];
			$$renderer.push(`<div><div class="mb-1 flex items-baseline justify-between gap-3"><span class="text-[10px] font-black tracking-wider text-gray-500 uppercase">${escape_html(row.label)}</span> <span class="font-mono text-sm font-black text-[#1A1A1A]">${escape_html(formatCount(row.count))} <span class="ml-2 text-[10px] text-gray-400">${escape_html(formatShare(row.share))}</span></span></div> <div class="h-2 bg-gray-100"><div${attr_class(clsx$1(["h-full", row.bar]))}${attr_style("", { width: row.count > 0 ? `max(${row.share}%, 3px)` : "0%" })}></div></div></div>`);
		}
		$$renderer.push(`<!--]--></div></section></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BTeL9q7v.js.map
