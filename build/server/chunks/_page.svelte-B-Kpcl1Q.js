import { U as escape_html, S as attr } from './dev-CorMzolj.js';
import './client-1LhY8Gzm.js';
import './index-server-CQ5DdqbI.js';
import './internal-Dmgq4tGE.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/backup/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		$$renderer.push(`<div class="flex min-h-screen bg-[#F4F4F4] p-8"><main class="max-w-4xl mx-auto w-full space-y-8"><header class="flex flex-col gap-2 border-b-4 border-[#1A1A1A] pb-6"><span class="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest block">Data Integrity Tools</span> <h1 class="text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">Database Backup Utility</h1> <p class="text-xs text-gray-500 font-bold uppercase">Automated backup dumps extraction and atomic system snapshots restoration.</p></header> <div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="bg-white border border-gray-200 p-6 shadow-xl flex flex-col justify-between"><div class="space-y-4"><h3 class="text-xs font-black uppercase text-[#1A1A1A] border-b-2 border-gray-100 pb-2">Export Datadump (Mongodump)</h3> <p class="text-[11px] text-gray-500 font-bold uppercase leading-relaxed">Full database archive. Every OEES field is included, including TIME_LOST_COMMENT failure splits.</p> <div class="p-3 bg-gray-50 border-l-4 border-[#1A1A1A] font-mono text-[9px] font-black uppercase text-gray-600">CMD: MONGODUMP --ARCHIVE --GZIP</div></div> <a href="/admin/backup/download" download="" class="w-full mt-6 bg-[#1A1A1A] hover:bg-[#FF4F00] text-white text-[11px] font-black uppercase tracking-widest py-3 shadow-md text-center block transition-all active:scale-95">DOWNLOAD COMPRESSED SNAPSHOT</a></div> <div class="bg-white border border-gray-200 p-6 shadow-xl flex flex-col justify-between"><form method="POST" action="?/restore" enctype="multipart/form-data" class="flex flex-col h-full justify-between"><div class="space-y-4"><h3 class="text-xs font-black uppercase text-[#1A1A1A] border-b-2 border-gray-100 pb-2">Import Datadump (Mongorestore)</h3> <p class="text-[11px] text-red-600 font-black uppercase leading-relaxed">⚠️ WARNING: Executing restoration overrides active cluster records. Active data tables will be purged before payload injection.</p> <div class="flex flex-col gap-2"><span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Target Backup File (.gz)</span> <label class="w-full bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#FF4F00] px-4 py-4 text-center cursor-pointer transition-colors block"><span class="text-[10px] font-black uppercase tracking-wider text-gray-500 block">${escape_html("SELECT OR DROP DATA BACKUP FILE")}</span> <input type="file" name="backupFile" accept=".gz" required="" class="hidden"/></label></div></div> <button type="submit"${attr("disabled", false, true)} class="w-full mt-6 bg-[#1A1A1A] hover:bg-red-600 disabled:bg-gray-300 text-white text-[11px] font-black uppercase tracking-widest py-3 shadow-md transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer">${escape_html("EXECUTE RESTORE OVERRIDE")}</button></form></div></div> `);
		if (form) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mt-4">`);
			if (form.success) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="p-4 bg-green-50 border-l-4 border-green-600 text-green-700 font-black text-[11px] uppercase shadow-md">CRITICAL RUNTIME: DATA INJECTION INTEGRITY VERIFIED. SYSTEM SNAPSHOT FULLY RESTORED WITH --DROP OVERRIDE.</div>`);
			} else if (form.error) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="p-4 bg-red-50 border-l-4 border-red-600 text-red-600 font-black text-[11px] uppercase shadow-md">CRITICAL REJECTION: RESTORE UTILITY FAILED // ${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></main></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Database Integrity Console</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B-Kpcl1Q.js.map
