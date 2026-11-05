import { a5 as escape_html, a3 as attr_class, a4 as stringify, a7 as ensure_array_like, X as derived } from './dev-CSPWYH9f.js';
import './client-aDAkbnwb.js';
import './internal-B31JjTno.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/rates/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const groups = derived(() => data.groups || []);
		const catalog = derived(() => data.catalog || []);
		const benchmarks = derived(() => data.benchmarks || []);
		function modeOf(values) {
			const counts = /* @__PURE__ */ new Map();
			for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
			let best = values[0];
			let bestCount = 0;
			for (const [value, count] of counts) if (count > bestCount) {
				best = value;
				bestCount = count;
			}
			return best;
		}
		function summary(group) {
			const positive = group.machines.map((machine) => machine.rate).filter((rate) => rate > 0);
			const missing = group.machines.some((machine) => machine.intervals > 0 && !(machine.rate > 0));
			const mixed = new Set(positive).size > 1;
			return {
				mode: positive.length ? String(modeOf(positive)) : "",
				missing,
				mixed,
				uniform: positive.length > 0 && !missing && !mixed
			};
		}
		const processStats = derived(() => {
			const stats = /* @__PURE__ */ new Map();
			for (const entry of catalog()) stats.set(entry.process, {
				process: entry.process,
				area: entry.area,
				machines: entry.machines.length,
				parts: 0,
				mixed: 0,
				missing: 0
			});
			for (const group of groups()) {
				if (!stats.has(group.process)) stats.set(group.process, {
					process: group.process,
					area: group.area,
					machines: group.machines.length,
					parts: 0,
					mixed: 0,
					missing: 0
				});
				const row = stats.get(group.process);
				row.parts += 1;
				const info = summary(group);
				if (info.mixed) row.mixed += 1;
				if (info.missing) row.missing += 1;
			}
			return [...stats.values()].filter((row) => row.parts > 0);
		});
		const rateCount = derived(() => groups().reduce((sum, group) => sum + group.machines.filter((machine) => machine.rate > 0).length, 0));
		const missingCount = derived(() => groups().filter((group) => summary(group).missing).length);
		function areaLabel(area) {
			return area === "MIXED" ? "BUILD / FINISH" : area || "BUILD";
		}
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-6 font-sans"><header class="mb-6 flex flex-col justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 xl:flex-row xl:items-end"><div><span class="mb-1 block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Standards</span> <h1 class="text-4xl leading-none font-black tracking-tighter text-[#1A1A1A] uppercase">Hourly Rates</h1> <p class="mt-2 max-w-3xl text-[11px] font-bold text-gray-500 uppercase">One rate usually covers every machine of a process that already runs the part. Uncheck a machine when its rate is different. A machine that has never run the part stays blank until you add it.</p></div> <div class="grid grid-cols-2 gap-2 sm:grid-cols-4"><div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Parts</span> <span class="font-mono text-lg font-black">${escape_html(groups().length.toLocaleString("en-US"))}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Rates</span> <span class="font-mono text-lg font-black">${escape_html(rateCount().toLocaleString("en-US"))}</span></div> <div class="bg-[#1A1A1A] px-4 py-3 text-white"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Missing</span> <span${attr_class(`font-mono text-lg font-black ${stringify(missingCount() ? "text-[#FF4F00]" : "")}`)}>${escape_html(missingCount().toLocaleString("en-US"))}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Full hours</span> <span class="font-mono text-lg font-black">${escape_html(benchmarks().length.toLocaleString("en-US"))}</span></div></div></header> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-red-600 bg-red-50 p-4 text-[11px] font-black tracking-widest text-red-700 uppercase">${escape_html(data.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="mb-4 flex flex-wrap gap-1"><button type="button"${attr_class(`border-2 px-3 py-2 text-[10px] font-black uppercase ${stringify("border-black bg-black text-white" )}`)}>Adjust</button> <button type="button"${attr_class(`border-2 px-3 py-2 text-[10px] font-black uppercase ${stringify("border-zinc-200 bg-white text-zinc-500")}`)}>Best hours</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		{
			$$renderer.push("<!--[0-->");
			{
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<section class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"><!--[-->`);
				const each_array = ensure_array_like(processStats());
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let row = each_array[$$index];
					$$renderer.push(`<button type="button" class="border border-zinc-200 bg-white p-4 text-left shadow-sm hover:border-[#FF4F00]"><span class="text-[8px] font-black tracking-widest text-gray-400 uppercase">${escape_html(areaLabel(row.area))}</span> <span class="mt-1 block text-sm font-black tracking-tight text-[#1A1A1A] uppercase">${escape_html(row.process)}</span> <span class="mt-3 block font-mono text-2xl leading-none font-black">${escape_html(row.parts.toLocaleString("en-US"))}</span> <span class="mt-1 block text-[9px] font-bold text-gray-400 uppercase">${escape_html(row.machines)} machines</span> `);
					if (row.mixed) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="mt-2 block text-[9px] font-black text-amber-700 uppercase">${escape_html(row.mixed)} with different rates</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (row.missing) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="block text-[9px] font-black text-[#FF4F00] uppercase">${escape_html(row.missing)} missing a rate</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></button>`);
				}
				$$renderer.push(`<!--]--></section>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C_TMl-mG.js.map
