import { a5 as attr_class, a4 as escape_html, a7 as ensure_array_like, a2 as attr, X as derived, a3 as stringify } from './dev-yuvcodp0.js';
import './client-Ck4Ac6hg.js';
import './internal-EKkdDKPi.js';
import './index-DBqjc0Yf.js';

//#endregion
//#region src/routes/notifier/andon/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const visibleCalls = derived(() => []);
		const outsideCount = derived(() => 0);
		const outsideLabel = derived(() => outsideCount() === 1 ? "1 outside this zone" : `${outsideCount()} outside this zone`);
		function getVisualSuffix(num) {
			const lastDigit = num % 10;
			const lastTwoDigits = num % 100;
			if (lastTwoDigits === 11 || lastTwoDigits === 12 || lastTwoDigits === 13) return "VA";
			if (lastDigit === 1) return "RA";
			if (lastDigit === 2) return "DA";
			if (lastDigit === 3) return "RA";
			if (lastDigit === 7) return "MA";
			if (lastDigit === 8) return "VA";
			if (lastDigit === 9) return "NA";
			if (lastDigit === 0 && num > 0) return "MA";
			return "TA";
		}
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-8 font-sans select-none"><main class="mx-auto max-w-7xl space-y-8"><header class="flex flex-col items-start justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 sm:flex-row sm:items-end"><div class="space-y-1"><span class="block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Audio Core Tools</span> <h1 class="text-4xl font-black tracking-tighter text-[#1A1A1A] uppercase">Andon Alerts &amp; Remote Voice Notifications</h1> <p class="text-xs font-bold text-gray-500 uppercase">Sequential message manager that queues simultaneous line failures back-to-back.</p></div> <div class="flex flex-wrap items-center gap-3 font-mono text-[10px] font-black tracking-wider uppercase"><button type="button" class="cursor-pointer border border-[#1A1A1A] bg-white px-4 py-2.5 transition-colors hover:bg-[#1A1A1A] hover:text-white">Listening</button> <button type="button" class="cursor-pointer border border-[#1A1A1A] bg-white px-4 py-2.5 transition-colors hover:bg-[#1A1A1A] hover:text-white">Voice</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5"><span${attr_class(`h-2.5 w-2.5 rounded-full ${stringify("bg-red-500")}`)}></span> ${escape_html("SISTEMA DESCONECTADO")}</div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<button class="animate-pulse cursor-pointer bg-[#FF4F00] px-6 py-3 text-white shadow-md transition-all hover:bg-[#1A1A1A]">🔊 ARMAR AUDIO EN BOCINAS</button>`);
		$$renderer.push(`<!--]--></div></header> `);
		if (visibleCalls().length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="border-2 border-dashed border-gray-300 bg-white p-16 text-center text-xs font-black tracking-widest text-gray-400 uppercase">`);
			if (outsideCount() > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`No calls in this zone. ${escape_html(outsideLabel())}.`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`⚙️ Ninguna señal de escalación activa en la red. Bocinas en espera de eventos.`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
			const each_array = ensure_array_like(visibleCalls());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<div class="relative flex animate-fade-in flex-col justify-between overflow-hidden border border-gray-200 border-l-4 border-red-600 bg-white shadow-xl transition-all duration-300"><div class="absolute top-0 right-0 flex h-16 w-16 items-center justify-center border-b border-l border-gray-100 bg-red-600/10"><span class="animate-ping font-mono text-sm font-black text-red-600">🚨</span></div> <div class="space-y-4 p-5"><div class="flex items-center justify-between pr-12"><span class="rounded-xs bg-red-600 px-2.5 py-1 text-[9px] font-black tracking-widest text-white uppercase">${escape_html(item.level)}${escape_html(getVisualSuffix(item.level))} ESCALACIÓN</span> <span class="font-mono text-[11px] font-bold text-[#1A1A1A]">${escape_html(new Date(item.timestamp).toLocaleTimeString())}</span></div> <div><span class="block font-mono text-[9px] font-bold tracking-wider text-gray-400 uppercase">Machine Name:</span> <h2 class="truncate font-mono text-2xl font-black tracking-tight text-[#1A1A1A] uppercase"${attr("title", item.machine)}>${escape_html(item.machine)} - ${escape_html(item.family)}</h2></div> <div class="space-y-1.5 border-t border-gray-100 pt-3 font-mono text-[10px] text-gray-600"><div class="flex justify-between gap-3"><span class="font-bold text-gray-400 uppercase">Proceso:</span> <span class="truncate font-black text-[#1A1A1A] uppercase"${attr("title", item.process)}>${escape_html(item.process || "—")}</span></div> <div class="flex justify-between"><span class="font-bold text-gray-400 uppercase">Tiempo Caído:</span> <span class="font-black text-red-600 uppercase">${escape_html(item.timeLost)} minutos</span></div> <div class="flex justify-between gap-3"><span class="font-bold text-gray-400 uppercase">Código De Falla:</span> <span class="max-w-[170px] truncate font-black text-[#1A1A1A] uppercase"${attr("title", item.failureCode)}>${escape_html(item.failureCode)}</span></div> <div class="flex justify-between gap-3"><span class="font-bold text-gray-400 uppercase">Estatus:</span> <span class="font-black text-[#1A1A1A] uppercase">${escape_html(item.attending)}</span></div></div></div> <div class="mt-auto flex flex-col gap-0.5 border-t border-gray-100 bg-red-50/50 p-4"><p class="text-[10px] font-black tracking-widest text-red-600 uppercase">Impacto a Producción de ${escape_html(item.family)}.</p></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></main></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <footer class="mx-auto max-w-7xl p-8 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Audio Core.</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-KgNmExjN.js.map
