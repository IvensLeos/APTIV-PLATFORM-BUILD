import { a4 as escape_html, a7 as ensure_array_like, a2 as attr, a5 as attr_class, a6 as clsx$1, X as derived } from './dev-yuvcodp0.js';
import { p as page } from './state-DBx2-N50.js';
import './client-Ck4Ac6hg.js';
import './internal-EKkdDKPi.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/backup/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const GROUPS = [
			{
				title: "Production",
				detail: "Intervals, downtime comments, transit failures, and failure rules."
			},
			{
				title: "Catalog",
				detail: "Taxonomy, hourly rates, conversions, stations, failure codes, and scrap codes."
			},
			{
				title: "Operation",
				detail: "Holidays, inventory bypass, the Finish route, and the daily plan."
			},
			{
				title: "Ingest",
				detail: "Scrape logs from REMAN61A, REMAN65, and REDBC001."
			},
			{
				title: "Andon",
				detail: "Open calls, escalation history, and the counters for the day."
			},
			{
				title: "Access",
				detail: "Accounts, password hashes, and session tokens."
			}
		];
		let dragging = false;
		let confirmPhrase = "";
		let isRestoring = false;
		let exporting = false;
		const you = derived(() => data.user?.username || "");
		const barDate = derived(() => page.url.searchParams.get("date") || "");
		const overLimit = derived(() => false);
		const canRestore = derived(() => false);
		const oddName = derived(() => false);
		const restoreLabel = derived(() => {
			return "Choose an archive first";
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-6 md:p-8"><main class="mx-auto w-full max-w-7xl space-y-8"><header class="flex flex-col gap-4 border-b-4 border-[#1A1A1A] pb-6 lg:flex-row lg:items-end lg:justify-between"><div class="flex flex-col gap-2"><span class="block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Data integrity</span> <h1 class="text-4xl font-black tracking-tighter text-[#1A1A1A] uppercase">Database backup</h1> <p class="max-w-3xl text-xs font-bold text-gray-500 uppercase">Download a gzip archive of APTIV_PLATFORM, or replace the live collections from one.
					Supervisors cannot open this page. `);
		if (you()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`Signed in as <span class="text-[#1A1A1A]">${escape_html(you())}</span>.`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></p></div> <p class="max-w-xs text-[10px] font-black tracking-widest text-gray-400 uppercase lg:text-right">`);
		if (barDate()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`Bar date ${escape_html(barDate())} is for dashboards. This archive is the whole database, not that day.`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`The operating date in the bar does not filter this archive.`);
		}
		$$renderer.push(`<!--]--></p></header> <section class="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="What this page does"><article class="border border-gray-200 bg-white p-5 shadow-xl"><span class="text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Scope</span> <h2 class="mt-2 text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">Full database</h2> <p class="mt-3 text-[11px] leading-relaxed font-bold text-gray-500">mongodump writes every collection into one gzip archive. The server builds the file, sends
					it, and deletes the temp copy.</p></article> <article class="border border-gray-200 bg-white p-5 shadow-xl"><span class="text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Credentials</span> <h2 class="mt-2 text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">Accounts travel with it</h2> <p class="mt-3 text-[11px] leading-relaxed font-bold text-gray-500">The archive includes password hashes and session tokens. Keep the file with the same care
					as a password.</p></article> <article class="border border-t-4 border-gray-200 border-t-red-600 bg-white p-5 shadow-xl"><span class="text-[9px] font-black tracking-widest text-red-600 uppercase">Replace</span> <h2 class="mt-2 text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">Drop, then load</h2> <p class="mt-3 text-[11px] leading-relaxed font-bold text-gray-500">Restore drops each collection inside the archive and loads that copy. It does not merge
					with what is live now.</p></article></section> <section class="border border-gray-200 bg-white shadow-xl" aria-label="Archive contents"><div class="border-b border-gray-100 px-6 py-4"><h2 class="text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">Inside every archive</h2> <p class="mt-1 text-[10px] font-bold text-gray-400 uppercase">A download from this page is the full cluster. Production intervals keep every field,
					including downtime comments.</p></div> <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
		const each_array = ensure_array_like(GROUPS);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let group = each_array[$$index];
			$$renderer.push(`<li class="border-t border-gray-100 p-6"><h3 class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase">${escape_html(group.title)}</h3> <p class="mt-2 text-[11px] leading-relaxed font-bold text-gray-500">${escape_html(group.detail)}</p></li>`);
		}
		$$renderer.push(`<!--]--></ul></section> `);
		if (form?.success) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="border-l-4 border-green-600 bg-green-50 px-4 py-3 text-[11px] font-black text-green-800 uppercase">The archive replaced the live collections. Sign in again if this session was not in that
				file.</p>`);
		} else if (form?.error) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[11px] font-black text-red-700 uppercase">${escape_html(form.error)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2"><section class="flex flex-col justify-between border border-t-4 border-gray-200 border-t-[#1A1A1A] bg-white p-6 shadow-xl"><div><h2 class="border-b-2 border-gray-100 pb-3 text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">Download archive</h2> <p class="mt-4 text-[11px] leading-relaxed font-bold text-gray-500">Use this before a restore or any change that is hard to undo. The file name starts with
						Backup_APTIV_PLATFORM_ and the operating day, which runs until 06:40.</p> <p class="mt-4 border-l-4 border-[#1A1A1A] bg-gray-50 px-3 py-2 font-mono text-[10px] font-bold text-gray-500 uppercase">mongodump --archive --gzip</p></div> <div class="mt-6 space-y-3">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <a href="/admin/backup/download" download=""${attr("aria-busy", exporting)}${attr_class(clsx$1(["block w-full py-3 text-center text-[10px] font-black tracking-widest text-white uppercase transition-colors", {
			"cursor-wait bg-gray-300": exporting,
			"bg-[#1A1A1A] hover:bg-[#FF4F00]": true
		}]))}>${escape_html("Download archive")}</a></div></section> <section class="flex flex-col border border-t-4 border-gray-200 border-t-red-600 bg-white p-6 shadow-xl"><h2 class="border-b-2 border-gray-100 pb-3 text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">Restore archive</h2> <p class="mt-4 text-[11px] leading-relaxed font-bold text-red-700">This replaces production, catalogs, the plan, andon state, and who can sign in. There is
					no undo except another archive.</p> <form method="POST" action="?/restore" enctype="multipart/form-data" class="mt-5 flex flex-1 flex-col gap-4"><div class="flex flex-col gap-1"><span class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Gzip archive, up to 256 MB</span> <label${attr_class(clsx$1(["block cursor-pointer border-2 border-dashed px-4 py-6 text-center transition-colors", {
			"border-[#FF4F00] bg-orange-50": dragging,
			"border-gray-200 bg-gray-50 hover:border-[#FF4F00]": true
		}]))}>`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<span class="block text-[10px] font-black tracking-wider text-gray-500 uppercase">Select or drop a .gz archive</span>`);
		$$renderer.push(`<!--]--> <input id="backupFile" name="backupFile" type="file" accept=".gz,application/gzip" required="" class="sr-only"/></label> `);
		if (overLimit()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-[10px] font-black text-red-700 uppercase">This file is over the 256 MB upload limit.</p>`);
		} else if (oddName()) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<p class="text-[10px] font-bold text-gray-400 uppercase">The name does not end in .gz. The server still checks the gzip header.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-1"><label for="confirm" class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Type RESTORE to arm this</label> <input id="confirm" name="confirm"${attr("value", confirmPhrase)} autocomplete="off" spellcheck="false" required="" placeholder="RESTORE" class="border border-gray-300 bg-gray-50 p-2.5 font-mono text-xs font-bold text-[#1A1A1A] uppercase outline-none focus:border-red-600"/></div> <button type="submit"${attr("disabled", !canRestore(), true)}${attr("aria-busy", isRestoring)} class="mt-auto cursor-pointer bg-red-600 py-3 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300">${escape_html(restoreLabel())}</button></form></section></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CjkfGkL4.js.map
