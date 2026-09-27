import { o as onDestroy } from './index-server-D1jVuM2R.js';
import { a6 as ensure_array_like, U as escape_html, S as attr } from './dev-BeB9xBTu.js';

//#region src/routes/notifier/andon/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeEscalations = [];
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
		onDestroy(() => {
			if (typeof window !== "undefined") window.speechSynthesis.cancel();
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-8 font-sans select-none"><main class="max-w-7xl mx-auto space-y-8"><header class="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-[#1A1A1A] pb-6 gap-4"><div class="space-y-1"><span class="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest block">Audio Core Tools</span> <h1 class="text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">Andon Alerts &amp; Remote Voice Notifications</h1> <p class="text-xs text-gray-500 font-bold uppercase">Sequential message manager that queues simultaneous line failures back-to-back.</p></div> <div class="flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-wider">`);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<button class="bg-[#FF4F00] hover:bg-[#1A1A1A] text-white px-6 py-3 shadow-md cursor-pointer animate-pulse transition-all">🔊 ARMAR AUDIO EN BOCINAS</button>`);
		$$renderer.push(`<!--]--></div></header> `);
		if (activeEscalations.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-white border-2 border-dashed border-gray-300 p-16 text-center text-xs font-black uppercase text-gray-400 tracking-widest">⚙️ Ninguna señal de escalación activa en la red. Bocinas en espera de eventos.</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
			const each_array = ensure_array_like(activeEscalations);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				$$renderer.push(`<div class="bg-white border border-gray-200 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 border-l-4 border-red-600 animate-fade-in"><div class="absolute top-0 right-0 w-16 h-16 bg-red-600/10 flex items-center justify-center border-b border-l border-gray-100"><span class="text-sm font-mono font-black text-red-600 animate-ping">🚨</span></div> <div class="p-5 space-y-4"><div class="flex justify-between items-center pr-12"><span class="bg-red-600 text-white text-[9px] font-black tracking-widest px-2.5 py-1 uppercase rounded-xs">${escape_html(item.level)}${escape_html(getVisualSuffix(item.level))} ESCALACIÓN</span> <span class="text-[11px] font-mono font-bold text-[#1A1A1A]">${escape_html(new Date(item.timestamp).toLocaleTimeString())}</span></div> <div><span class="text-[9px] font-mono font-bold text-gray-400 uppercase block tracking-wider">Machine Name:</span> <h2 class="text-2xl font-black text-[#1A1A1A] uppercase tracking-tight font-mono truncate"${attr("title", item.machine)}>${escape_html(item.machine)} - ${escape_html(item.family)}</h2></div> <div class="space-y-1.5 border-t border-gray-100 pt-3 font-mono text-[10px] text-gray-600"><div class="flex justify-between"><span class="uppercase font-bold text-gray-400">Tiempo Caído:</span> <span class="uppercase font-black text-red-600">${escape_html(item.timeLost)} minutos</span></div> <div class="flex justify-between"><span class="uppercase font-bold text-gray-400">Código De Falla:</span> <span class="font-black text-[#1A1A1A] truncate uppercase max-w-[170px]"${attr("title", item.failureCode)}>${escape_html(item.failureCode)}</span></div> <div class="flex justify-between"><span class="uppercase font-bold text-gray-400">Estatus:</span> <span class="font-black text-[#1A1A1A] uppercase">${escape_html(item.attending)}</span></div></div></div> <div class="bg-red-50/50 p-4 border-t border-gray-100 mt-auto flex flex-col gap-0.5"><p class="text-[10px] font-black text-red-600 uppercase tracking-widest">Impacto a Producción de ${escape_html(item.family)}.</p></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></main></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Audio Core.</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CnPBvJbL.js.map
