import { U as escape_html, S as attr, a7 as ensure_array_like, K as derived } from './dev-CorMzolj.js';
import './client-ByYMSKKg.js';
import './index-server-CQ5DdqbI.js';
import './internal-C0ucU1d4.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/scrap-tickets/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let currentScannedBarcode = "";
		let isProcessing = false;
		let verifiedTickets = [];
		let qrCacheMap = {};
		const consolidatedBoxes = derived(() => {
			const boxesMap = {};
			let boxCounter = 1;
			[...verifiedTickets].reverse().forEach((piece) => {
				const boxKey = `${piece.family}|${piece.failure}`;
				if (!boxesMap[boxKey]) {
					boxesMap[boxKey] = {
						boxId: `BOX-${String(boxCounter).padStart(2, "0")}`,
						family: piece.family,
						failure: piece.failure,
						machineSource: piece.machine,
						processSource: piece.process,
						partNumber: piece.partNumber,
						operationalDay: piece.operationalDay,
						shift: piece.shift,
						barcodesList: []
					};
					boxCounter++;
				}
				if (!boxesMap[boxKey].barcodesList.includes(piece.barcode)) boxesMap[boxKey].barcodesList.unshift(piece.barcode);
			});
			Object.values(boxesMap).forEach(async (box) => {
				if (!qrCacheMap[box.boxId]) try {
					const base64Str = await (await import('qrcode')).toDataURL(box.boxId, {
						margin: 1,
						width: 60
					});
					qrCacheMap = {
						...qrCacheMap,
						[box.boxId]: base64Str
					};
				} catch (e) {
					console.error("Error generando QR local:", e);
				}
			});
			return Object.values(boxesMap).sort((a, b) => a.boxId.localeCompare(b.boxId));
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-8 text-[#1A1A1A] font-sans select-none print:p-0 print:bg-white"><header class="mb-8 border-b-4 border-[#1A1A1A] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4 print:hidden"><div><span class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase block mb-1">Value Stream Sorting &amp; Batch Scraping</span> <h1 class="text-5xl font-black tracking-tighter text-[#1A1A1A] uppercase leading-none">Mass Scrap Segregation</h1></div> <div class="flex gap-2">`);
		if (verifiedTickets.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button class="bg-gray-200 hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-black text-xs uppercase tracking-wider px-4 py-3.5 transition-colors cursor-pointer border border-gray-300">Manejar Lote / Limpiar</button> <button class="bg-[#FF4F00] hover:bg-[#1A1A1A] text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 transition-colors cursor-pointer shadow-md active:scale-98">🖨️ IMPRIMIR METAS DE CAJAS (${escape_html(consolidatedBoxes().length)})</button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></header> <main class="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block svelte-1ceb7c6"><section class="print:hidden flex flex-col gap-6"><form class="bg-white border-2 border-[#1A1A1A] p-6 shadow-xl flex flex-col gap-4"><h2 class="text-base font-black uppercase tracking-tight border-b border-gray-100 pb-2">🎯 Scanner Input (1-by-1)</h2> <div class="flex flex-col gap-1.5"><label for="barcode-input" class="text-[9px] font-black text-gray-400 uppercase tracking-wider">Scan Unit Serial Barcode</label> <input id="barcode-input" type="text"${attr("disabled", isProcessing, true)}${attr("value", currentScannedBarcode)} placeholder="ESCANEE SERIE..." class="w-full bg-gray-50 border-2 border-gray-200 p-3 font-mono text-sm font-black text-gray-800 outline-none focus:border-[#FF4F00] uppercase tracking-wider placeholder:text-gray-300"/></div></form> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section> <section class="lg:col-span-2 space-y-6 print:space-y-0 print:w-full"><div class="bg-white border border-gray-200 p-4 shadow-sm flex justify-between items-center print:hidden"><span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matriz Acumulada del Lote</span> <div class="flex gap-4 text-xs font-black"><div>📦 CAJAS ACTIVAS: <span class="text-[#FF4F00] font-mono">${escape_html(consolidatedBoxes().length)}</span></div> <div>🧮 TOTAL PIEZAS: <span class="text-blue-600 font-mono">${escape_html(verifiedTickets.length)}</span></div></div></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:w-full">`);
		const each_array = ensure_array_like(consolidatedBoxes());
		if (each_array.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let box = each_array[i];
				$$renderer.push(`<div class="bg-white border-4 border-black p-5 font-mono text-[11px] leading-tight text-black shadow-lg relative flex flex-col justify-between h-[360px] print:shadow-none print:border-2 print:w-[85mm] print:h-[125mm] print:page-break-inside-avoid print:mb-8"><div><header class="border-b-2 border-black pb-2 text-center relative flex justify-between items-center gap-2"><div class="text-left flex-1"><div class="bg-black text-white font-black text-[9px] py-0.5 px-1.5 uppercase tracking-widest inline-block">APTIV BATCH SCRAP</div> <div class="text-3xl font-black tracking-tighter text-black mt-1 leading-none">${escape_html(box.boxId)}</div> <div class="text-[9px] font-black text-blue-600 mt-1">CANTIDAD TOTAL: ${escape_html(box.barcodesList.length)} PCS</div></div> `);
				if (qrCacheMap[box.boxId]) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<img${attr("src", qrCacheMap[box.boxId])} alt="QR Contenedor" class="w-[55px] h-[55px] object-contain flex items-center justify-center"/>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="w-[55px] h-[55px] border border-dashed border-gray-200 animate-pulse bg-gray-50"></div>`);
				}
				$$renderer.push(`<!--]--></header> <div class="my-2.5 space-y-0.5 uppercase font-bold text-[10px] border-b border-dashed border-gray-300 pb-2"><div><span class="text-gray-400">OPERATIONAL DATE:</span> ${escape_html(box.operationalDay)}</div> <div><span class="text-gray-400">SHIFT LOGGED:</span> ${escape_html(box.shift)}</div> <div><span class="text-gray-400">PRODUCT FAMILY:</span> ${escape_html(box.family)}</div> <div><span class="text-gray-400">BASE PART NUMBER:</span> ${escape_html(box.partNumber)}</div> <div class="text-[9px] font-black text-gray-600 mt-1">📍 SOURCE: ${escape_html(box.machineSource)} (${escape_html(box.processSource)})</div></div> <div class="my-2"><span class="text-[8px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Scanned Serials List (${escape_html(box.barcodesList.length)}):</span> <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 max-h-[85px] overflow-y-auto pr-1 text-[9px] font-mono text-gray-800 bg-gray-50 p-1 border font-bold print:max-h-none print:overflow-visible print:bg-white"><!--[-->`);
				const each_array_1 = ensure_array_like(box.barcodesList);
				for (let sIdx = 0, $$length = each_array_1.length; sIdx < $$length; sIdx++) {
					let serial = each_array_1[sIdx];
					$$renderer.push(`<div>${escape_html(sIdx + 1)}. ${escape_html(serial)}</div>`);
				}
				$$renderer.push(`<!--]--></div></div></div> <footer class="border-t-2 border-black pt-2 mt-auto"><div class="text-[10px] font-black text-red-600 uppercase leading-none tracking-tight truncate"${attr("title", box.failure)}>DEFECTO RAÍZ: ${escape_html(box.failure)}</div> <div class="text-[8px] font-black text-slate-800 leading-tight mt-1">💥 IMPACTO A PRODUCCIÓN DE ${escape_html(box.family)} PARA LOS SIGUIENTES PROCESOS</div></footer></div>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="col-span-full bg-white border-2 border-dashed border-gray-200 p-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest italic print:hidden">📋 Rack vacío. Comience a escanear piezas para inicializar los estantes virtuales de segregación.</div>`);
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div></section></main></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DF-Nu1h9.js.map
