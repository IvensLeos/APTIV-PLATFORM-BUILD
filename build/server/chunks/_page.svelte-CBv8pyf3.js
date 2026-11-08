import { a4 as escape_html, a2 as attr, a7 as ensure_array_like, X as derived } from './dev-yuvcodp0.js';

//#region src/routes/admin/scrap-tickets/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let barcode = "";
		let scanning = false;
		let pieces = [];
		let qrCache = {};
		const boxes = derived(() => {
			const grouped = /* @__PURE__ */ new Map();
			let count = 1;
			for (const piece of [...pieces].reverse()) {
				const key = [
					piece.family,
					piece.partNumber,
					piece.serverProcess,
					piece.defect
				].join("|");
				if (!grouped.has(key)) {
					grouped.set(key, {
						key,
						boxId: `BOX-${String(count).padStart(2, "0")}`,
						family: piece.family,
						type: piece.type,
						partNumber: piece.partNumber,
						plantProcess: piece.plantProcess,
						serverProcess: piece.serverProcess,
						defect: piece.defect,
						serials: []
					});
					count += 1;
				}
				const box = grouped.get(key);
				if (!box.serials.some((row) => row.barcode === piece.barcode)) box.serials.push({
					barcode: piece.barcode,
					comment: piece.comment,
					scrapCode: piece.scrapCode,
					station: piece.station,
					shift: piece.shift,
					operationalDay: piece.operationalDay
				});
			}
			return [...grouped.values()];
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-6 font-sans text-[#1A1A1A] print:bg-white print:p-0"><header class="mb-6 flex flex-col justify-between gap-4 border-b-4 border-[#1A1A1A] pb-6 print:hidden lg:flex-row lg:items-end"><div><span class="mb-1 block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Family · part · process · defect</span> <h1 class="text-4xl leading-none font-black tracking-tighter uppercase">Scrap tickets</h1> <p class="mt-2 max-w-xl text-[11px] font-bold text-gray-500 uppercase">The last open fail or rework disposes the piece. A diagnosis confirms it. A scrap ticket records the comment.</p></div> <div class="grid grid-cols-3 gap-2"><div class="bg-[#1A1A1A] px-4 py-3 text-white"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Source</span> <span class="font-mono text-sm font-black">${escape_html(data.fixtureMode ? "Dev samples" : "Live ERP")}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Boxes</span> <span class="font-mono text-sm font-black text-[#FF4F00]">${escape_html(boxes().length)}</span></div> <div class="bg-white px-4 py-3"><span class="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">Pieces</span> <span class="font-mono text-sm font-black">${escape_html(pieces.length)}</span></div></div></header> `);
		if (data.fixtureMode) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-amber-500 bg-amber-50 p-3 text-[11px] font-bold text-amber-950 uppercase print:hidden">Development reads the reference unit history and the sample files. Live servers are not called.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (data.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mb-4 border-2 border-amber-500 bg-amber-50 p-3 text-[11px] font-black text-amber-800 uppercase print:hidden">${escape_html(data.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <main class="grid grid-cols-1 gap-6 print:block lg:grid-cols-3 svelte-1ceb7c6"><section class="flex flex-col gap-4 print:hidden"><form class="border-2 border-[#1A1A1A] bg-white p-5 shadow-[6px_6px_0_0_#1A1A1A]"><h2 class="border-b border-gray-100 pb-2 text-sm font-black tracking-tight uppercase">Scan a serial</h2> <label for="scrap-barcode" class="mt-4 block text-[9px] font-black tracking-wider text-gray-400 uppercase">Unit barcode</label> <input id="scrap-barcode"${attr("value", barcode)} autocomplete="off" spellcheck="false"${attr("disabled", scanning, true)} placeholder="Scan or type a serial" class="mt-1 w-full border-2 border-gray-200 bg-gray-50 p-3 font-mono text-sm font-black tracking-wider uppercase outline-none placeholder:text-gray-300 focus:border-[#FF4F00] disabled:opacity-60"/> <button type="submit"${attr("disabled", !barcode.trim(), true)} class="mt-3 w-full bg-[#FF4F00] px-4 py-3 text-[11px] font-black tracking-widest text-white uppercase disabled:cursor-wait disabled:bg-gray-300">${escape_html("Classify")}</button></form> `);
		if (data.fixtureMode && data.samples?.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="border border-gray-200 bg-white p-4"><h2 class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Sample serials</h2> <ul class="mt-3 flex flex-col gap-2"><!--[-->`);
			const each_array = ensure_array_like(data.samples);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let sample = each_array[$$index];
				$$renderer.push(`<li class="border border-gray-100 p-2"><button type="button" class="w-full text-left"${attr("disabled", scanning, true)}><span class="block font-mono text-[11px] font-black">${escape_html(sample.barcode)}</span> <span class="mt-1 block text-[10px] font-bold text-gray-500 uppercase">${escape_html(sample.plantProcess)} · ${escape_html(sample.serverProcess)} · ${escape_html(sample.defect)}</span> <span class="mt-1 block text-[10px] leading-snug font-medium text-gray-400 normal-case">${escape_html(sample.note)}</span></button></li>`);
			}
			$$renderer.push(`<!--]--></ul></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (pieces.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex gap-2">`);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button type="button" class="flex-1 border border-gray-300 bg-white px-3 py-3 text-[10px] font-black tracking-wider uppercase">Clear rack</button> <button type="button" class="flex-1 bg-[#FF4F00] px-3 py-3 text-[10px] font-black tracking-wider text-white uppercase">Print ${escape_html(boxes().length)} ${escape_html(boxes().length === 1 ? "box" : "boxes")}</button>`);
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section> <section class="space-y-4 lg:col-span-2 print:space-y-0">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-1 gap-4 print:grid-cols-2 sm:grid-cols-2">`);
		const each_array_2 = ensure_array_like(boxes());
		if (each_array_2.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
				let box = each_array_2[$$index_3];
				$$renderer.push(`<article class="flex min-h-[22rem] flex-col justify-between border-4 border-black bg-white p-4 font-mono text-[11px] shadow-lg print:mb-6 print:h-auto print:min-h-0 print:w-[85mm] print:shadow-none print:break-inside-avoid"><div><header class="flex items-start justify-between gap-3 border-b-2 border-black pb-2"><div><div class="inline-block bg-black px-1.5 py-0.5 text-[9px] font-black tracking-widest text-white uppercase">Aptiv scrap</div> <div class="mt-1 text-3xl leading-none font-black tracking-tighter">${escape_html(box.boxId)}</div> <div class="mt-1 text-[10px] font-black text-blue-700 uppercase">${escape_html(box.serials.length)} pcs</div></div> `);
				if (qrCache[box.boxId]) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<img${attr("src", qrCache[box.boxId])} alt="" class="h-16 w-16"/>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="h-16 w-16 animate-pulse border border-dashed border-gray-200 bg-gray-50"></div>`);
				}
				$$renderer.push(`<!--]--></header> <div class="mt-2 space-y-0.5 text-[10px] font-bold uppercase"><div><span class="text-gray-400">Family</span> ${escape_html(box.family)}${escape_html(box.type ? ` · ${box.type}` : "")}</div> <div><span class="text-gray-400">Part</span> ${escape_html(box.partNumber)}</div> <div><span class="text-gray-400">Process</span> ${escape_html(box.plantProcess)} · ${escape_html(box.serverProcess)}</div></div> <ul class="mt-2 max-h-28 overflow-y-auto border bg-gray-50 p-1 text-[9px] font-bold print:max-h-none print:overflow-visible print:bg-white"><!--[-->`);
				const each_array_3 = ensure_array_like(box.serials);
				for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
					let serial = each_array_3[index];
					$$renderer.push(`<li>${escape_html(index + 1)}. ${escape_html(serial.barcode)} `);
					if (serial.comment) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-gray-500">· ${escape_html(serial.comment)}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></li>`);
				}
				$$renderer.push(`<!--]--></ul></div> <footer class="mt-3 border-t-2 border-black pt-2"><div class="text-[11px] leading-tight font-black text-red-700 uppercase">${escape_html(box.defect)}</div></footer></article>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<div class="col-span-full border-2 border-dashed border-gray-200 bg-white p-12 text-center text-[11px] font-bold tracking-widest text-gray-400 uppercase print:hidden">The rack is empty. Scan a serial to open the first box.</div>`);
		}
		$$renderer.push(`<!--]--></div></section></main></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CBv8pyf3.js.map
