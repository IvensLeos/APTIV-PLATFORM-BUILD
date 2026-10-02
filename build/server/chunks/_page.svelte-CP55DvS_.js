import { U as escape_html, S as attr } from './dev-CorMzolj.js';
import './client-7pnEKwh9.js';
import './index-server-CQ5DdqbI.js';
import './internal-FoTrLbld.js';
import './index-DBqjc0Yf.js';

//#region src/routes/login/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		let isLoading = false;
		$$renderer.push(`<div class="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 svelte-1x05zx6"><div class="w-full max-w-md bg-white border-4 border-[#1A1A1A] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-8 svelte-1x05zx6"><header class="mb-8 border-b-2 border-gray-100 pb-4 svelte-1x05zx6"><span class="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.2em] svelte-1x05zx6">Restricted Access</span> <h2 class="text-3xl font-black uppercase tracking-tighter text-[#1A1A1A] svelte-1x05zx6">Terminal Login</h2></header> <form method="POST" class="flex flex-col gap-6 svelte-1x05zx6"><div class="flex flex-col gap-2 svelte-1x05zx6"><label for="username" class="text-[10px] font-black uppercase text-gray-400 tracking-widest svelte-1x05zx6">Username / Employee ID</label> <input type="text" id="username" name="username" required="" autocomplete="username" placeholder="ENTER ID" class="w-full bg-gray-50 border-2 border-[#1A1A1A] px-4 py-3 text-sm font-bold uppercase outline-none focus:bg-white focus:border-[#FF4F00] transition-all svelte-1x05zx6"/></div> <div class="flex flex-col gap-2 svelte-1x05zx6"><label for="password" class="text-[10px] font-black uppercase text-gray-400 tracking-widest svelte-1x05zx6">Security Code</label> <input type="password" id="password" name="password" required="" autocomplete="current-password" placeholder="••••••••" class="w-full bg-gray-50 border-2 border-[#1A1A1A] px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-[#FF4F00] transition-all svelte-1x05zx6"/></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border-l-4 border-red-600 p-3 text-[10px] font-black text-red-600 uppercase animate-shake svelte-1x05zx6">Access Denied: ${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", isLoading, true)} class="mt-4 w-full bg-[#1A1A1A] text-white py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#FF4F00] transition-colors disabled:bg-gray-300 active:translate-y-1 shadow-md svelte-1x05zx6">${escape_html("Authorize Entry")}</button></form> <footer class="mt-8 text-center svelte-1x05zx6"><p class="text-[9px] font-bold text-gray-400 uppercase italic svelte-1x05zx6">Aptiv Operations Platform © ${escape_html((/* @__PURE__ */ new Date()).getFullYear())}</p></footer></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CP55DvS_.js.map
