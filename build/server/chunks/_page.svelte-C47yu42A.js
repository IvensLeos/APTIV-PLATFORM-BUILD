import { a5 as escape_html, a7 as ensure_array_like, a2 as attr, a3 as attr_class, a4 as stringify, a6 as attr_style, X as derived } from './dev-CSPWYH9f.js';
import { F as FINISH_ROUTE, i as isFinishProcess, b as isBuildProcess } from './plantAreas-DImca8Fn.js';
import { p as page } from './state-nCAFLkfF.js';
import { c as captureHref } from './capturePath-R_tTjP2G.js';
import './client-DZ8k5AXj.js';
import './internal-KhZZ_anA.js';
import './index-DBqjc0Yf.js';

//#region src/routes/capture/[process]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const BUILD_PROCESSES = [
			"LASER ETCH",
			"SMT",
			"UNDERFILL",
			"PTH",
			"XRAY",
			"ICT",
			"MOL",
			"PROGRAMMING",
			"SINGULATION",
			"LGA CONTAINMENT",
			"EDGEBOND",
			"ROUTERMILLING",
			"ANTENNA ATTACH",
			"LEAKTEST",
			"CONFORMAL",
			"SCREWDRIVE"
		];
		const processName = derived(() => data.processName || "");
		const finishScreen = derived(() => page.url.searchParams.get("area") === "finish" || isFinishProcess(processName()) && !isBuildProcess(processName()));
		const selectedDate = derived(() => data.selectedDate || "");
		const rawStations = derived(() => data.machines || []);
		const processes = derived(() => data.area === "FINISH" ? data.finishRoute?.length ? data.finishRoute : FINISH_ROUTE : BUILD_PROCESSES);
		let searchTerm = "";
		const filteredStations = derived(() => rawStations().filter((station) => {
			const needle = searchTerm.trim().toUpperCase();
			if (!needle) return true;
			return `${station.name} ${(station.stations || []).join(" ")}`.toUpperCase().includes(needle);
		}));
		const processStats = derived(() => {
			return {
				total: rawStations().length,
				withGaps: rawStations().filter((station) => station.hasGaps).length,
				totalGaps: rawStations().reduce((acc, station) => acc + (station.pendingCount || 0), 0)
			};
		});
		function stationHref(machine) {
			const base = captureHref(processName(), machine.name, selectedDate());
			return data.area === "FINISH" ? `${base}&area=finish` : base;
		}
		function processHref(name) {
			const base = captureHref(name, "", selectedDate());
			return data.area === "FINISH" ? `${base}&area=finish` : base;
		}
		function sideLabel(serverProcess) {
			if (String(serverProcess || "").includes("SPI_S2")) return "SPI 2";
			return "";
		}
		function performanceOf(machine) {
			const expected = Number(machine.expected) || 0;
			if (expected <= 0) return null;
			return Math.round((Number(machine.produced) || 0) / expected * 100);
		}
		function shiftColor(shift) {
			if (!shift?.hasData) return "#1A1A1A";
			return shift.efficiency < 85 ? "#dc2626" : "#16a34a";
		}
		function shiftGradient(shifts) {
			const [first, second, third] = [
				0,
				1,
				2
			].map((index) => shiftColor(shifts?.[index]));
			return `linear-gradient(90deg, ${first} 0%, ${first} 33.333%, ${second} 33.333%, ${second} 66.666%, ${third} 66.666%, ${third} 100%)`;
		}
		function shiftTitle(shifts) {
			return (shifts || []).map((shift) => `${shift.id} ${shift.hasData ? `${shift.efficiency}%` : "—"}`).join(" · ");
		}
		$$renderer.push(`<div class="flex min-h-screen bg-zinc-100 font-sans text-zinc-900 antialiased"><aside class="sticky top-0 flex h-screen w-44 shrink-0 flex-col border-r border-zinc-200 bg-white shadow-xs"><header class="border-b border-zinc-100 p-4 text-center"><span class="mb-1 block text-[9px] font-black tracking-widest text-orange-600 uppercase">Processes</span> <h2 class="text-sm font-black text-zinc-900 uppercase leading-tight">${escape_html(data.area === "FINISH" ? "Finish" : "Build")}</h2> <div class="mt-2 inline-block rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[8px] font-bold text-zinc-400 uppercase">${escape_html(processes().length)} Processes</div></header> <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-2"><!--[-->`);
		const each_array = ensure_array_like(processes());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let name = each_array[$$index];
			$$renderer.push(`<a${attr("href", processHref(name))}${attr_class(`border-l-4 px-3 py-2 text-[10px] font-black uppercase leading-tight transition-all ${stringify(processName() === name ? "border-orange-600 bg-zinc-50 text-orange-600" : "border-transparent text-zinc-400 hover:bg-zinc-200")}`)}>${escape_html(name)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></aside> <main class="min-w-0 flex-1 p-6"><header class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-4 border-zinc-900 pb-5"><div><span class="mb-1 block text-[9px] font-black tracking-widest text-orange-600 uppercase">Production capture</span> <h1 class="text-4xl font-black tracking-tighter text-zinc-900 uppercase">${escape_html(processName())}</h1></div> <div class="text-right"><span${attr_class(`font-mono text-3xl font-black tabular-nums leading-none ${stringify(processStats().totalGaps > 0 ? "text-amber-600" : "text-emerald-600")}`)}>${escape_html(processStats().totalGaps)}</span> <span class="mt-1 block text-[9px] font-black tracking-widest text-zinc-400 uppercase">Open gaps · ${escape_html(processStats().withGaps)} of ${escape_html(processStats().total)} lines · ${escape_html(selectedDate())}</span></div></header> <div class="mb-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"><div class="relative w-full sm:w-72"><input type="text"${attr("value", searchTerm)} placeholder="FIND LINE OR STATION" class="w-full border border-zinc-300 bg-white px-3 py-2 text-xs font-black uppercase outline-none focus:border-zinc-900"/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <p class="text-[10px] font-black tracking-wider text-zinc-400 uppercase">${escape_html(filteredStations().length)} of ${escape_html(rawStations().length)}</p></div> `);
		if (filteredStations().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="border border-zinc-900 border-l-4 border-l-[#FF4F00] bg-white p-5 text-xs font-black tracking-widest text-zinc-900 uppercase">`);
			if (finishScreen() && true) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`No machines are registered for ${escape_html(processName())}. Finish capture stays off the build list. Map a station to this process and it opens here.`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`No stations match this search on ${escape_html(processName())}`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"><!--[-->`);
			const each_array_1 = ensure_array_like(filteredStations());
			for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
				let machine = each_array_1[$$index_3];
				const side = sideLabel(machine.currentServerProcess);
				const efficiency = performanceOf(machine);
				$$renderer.push(`<a${attr("href", stationHref(machine))} class="group flex flex-col overflow-hidden border-2 border-gray-200 bg-white shadow-xs transition-colors hover:border-[#FF4F00]"><div class="h-2 w-full"${attr("title", shiftTitle(machine.shifts))}${attr_style("", { background: shiftGradient(machine.shifts) })}></div> <div class="grid grid-cols-3 px-2 pt-1"><!--[-->`);
				const each_array_2 = ensure_array_like(machine.shifts);
				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let shift = each_array_2[$$index_1];
					$$renderer.push(`<span class="text-center text-[8px] font-black tracking-widest text-zinc-400 uppercase">${escape_html(shift.id)}</span>`);
				}
				$$renderer.push(`<!--]--></div> <div class="flex flex-1 flex-col p-4 pt-2"><div class="flex items-start justify-between gap-3"><h2 class="min-w-0 text-base font-black tracking-tight text-zinc-900 uppercase leading-tight">${escape_html(machine.name)}</h2> <div class="shrink-0 text-right"><span${attr_class(`block font-mono text-2xl font-black tabular-nums leading-none ${stringify(efficiency == null ? "text-zinc-300" : efficiency < 85 ? "text-red-600" : "text-emerald-600")}`)}>${escape_html(efficiency == null ? "—" : `${efficiency}%`)}</span> <span class="text-[9px] font-black tracking-widest text-zinc-400 uppercase">Performance</span> `);
				if (machine.programmedMinutes > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="mt-0.5 block text-[8px] font-bold tracking-wide text-sky-700 uppercase">${escape_html(Math.round(machine.programmedMinutes))}m PD out</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div> <div class="mt-3"><span class="block text-[9px] font-black tracking-widest text-zinc-400 uppercase">Station</span> `);
				if (machine.stations?.length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<!--[-->`);
					const each_array_3 = ensure_array_like(machine.stations);
					for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
						let code = each_array_3[$$index_2];
						$$renderer.push(`<span class="block font-mono text-[13px] font-bold tracking-wide text-zinc-900">${escape_html(code)}</span>`);
					}
					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<span class="block font-mono text-[13px] font-bold tracking-wide text-zinc-400">Unmapped</span>`);
				}
				$$renderer.push(`<!--]--></div> <div class="mt-3 border-l-4 border-sky-600 bg-zinc-50 px-2 py-1.5"><span class="block text-[9px] font-black tracking-widest text-zinc-400 uppercase">Last running family</span> <span class="mt-0.5 flex items-center gap-2"><span class="truncate text-sm font-black tracking-tight text-zinc-900 uppercase">${escape_html(machine.currentFamily || "—")}</span> `);
				if (side) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="shrink-0 bg-zinc-900 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white">${escape_html(side)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></span></div> <div class="mt-3 flex items-end justify-between gap-3 border-t border-zinc-100 pt-3"><div><span class="block text-[9px] font-black tracking-widest text-zinc-400 uppercase">Status</span> <span${attr_class(`text-[11px] font-black uppercase ${stringify(machine.hasGaps ? "text-amber-600" : "text-emerald-600")}`)}>${escape_html(machine.hasGaps ? `${machine.pendingCount} gaps pending` : "Capture clean")}</span></div> <span class="shrink-0 bg-zinc-100 px-2 py-1 text-[10px] font-black text-zinc-900 transition-colors group-hover:bg-[#FF4F00] group-hover:text-white">OPEN →</span></div></div></a>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></main></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C47yu42A.js.map
