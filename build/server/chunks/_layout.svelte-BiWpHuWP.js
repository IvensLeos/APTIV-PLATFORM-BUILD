import { a1 as head, a2 as attr, a3 as attr_class, a4 as stringify, a5 as escape_html, X as derived } from './dev-CSPWYH9f.js';
import { d as getOperationalDateStr } from './plantTime-CjpO2xUR.js';
import { i as isFinishProcess, b as isBuildProcess } from './plantAreas-DImca8Fn.js';
import './client-6KIdr_XV.js';
import { p as page } from './state-BHHPCYqL.js';
import './internal-CgBSK0xL.js';
import './index-DBqjc0Yf.js';

//#endregion
//#region src/lib/components/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user = null} = $$props;
		const getCurrentOperativeDay = () => getOperationalDateStr();
		const canSeeAdminPanel = derived(() => !!user && ["SUPERVISOR", "ADMIN"].includes(user.role));
		const activeDateStr = derived(() => page.url.searchParams.get("date") || getCurrentOperativeDay());
		const plantArea = derived(() => {
			if (page.url.searchParams.get("area") === "finish") return "FINISH";
			const parts = page.url.pathname.split("/").filter(Boolean);
			if ((parts[0] === "capture" || parts[0] === "dashboard") && parts[1]) {
				const name = parts[1].toUpperCase().replace(/-/g, " ");
				if (isFinishProcess(name) && !isBuildProcess(name)) return "FINISH";
			}
			return "BUILD";
		});
		const guestLoginHref = derived(() => {
			const url = new URL(page.url);
			url.searchParams.set("login", "1");
			url.searchParams.delete("next");
			return `${url.pathname}${url.search}`;
		});
		function getUrl(path, customDate) {
			const url = new URL(path, "http://aptiv.local");
			url.searchParams.set("date", customDate || activeDateStr());
			if (plantArea() === "FINISH") url.searchParams.set("area", "finish");
			return `${url.pathname}${url.search}`;
		}
		$$renderer.push(`<nav class="bg-[#1A1A1A] text-white p-4 shadow-xl border-b-4 border-[#FF4F00] w-full relative z-50 font-sans"><div class="max-w-7xl mx-auto flex justify-between items-center"><a${attr("href", getUrl("/", getCurrentOperativeDay()))} class="flex items-center gap-4 hover:opacity-90 transition-opacity"><div class="bg-[#FF4F00] text-white font-black px-3 py-1 text-xl tracking-tighter select-none">APTIV</div> <div class="h-6 w-[1px] bg-gray-600 hidden md:block"></div> <h1 class="text-sm md:text-lg font-bold tracking-widest uppercase opacity-90">OEE Real-Time Monitoring</h1></a> <div class="flex items-center gap-6"><div class="flex shrink-0 border border-white/30"><button type="button"${attr_class(`cursor-pointer px-3 py-1 text-[10px] font-black tracking-widest uppercase ${stringify(plantArea() === "BUILD" ? "bg-[#FF4F00] text-white" : "text-gray-400 hover:text-white")}`)}>Build</button> <button type="button"${attr_class(`cursor-pointer border-l border-white/30 px-3 py-1 text-[10px] font-black tracking-widest uppercase ${stringify(plantArea() === "FINISH" ? "bg-[#FF4F00] text-white" : "text-gray-400 hover:text-white")}`)}>Finish</button></div> <div class="relative"><button${attr_class(`text-[10px] font-black uppercase tracking-widest border-b-2 py-1 transition-all flex items-center gap-2 text-white cursor-pointer ${stringify("border-transparent hover:border-[#FF4F00]")}`)}>Live Dashboards <span${attr_class(`text-[8px] transition-transform duration-200 ${stringify("")}`)}>▼</span></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="relative"><button${attr_class(`text-[10px] font-black uppercase tracking-widest border-b-2 py-1 transition-all flex items-center gap-2 text-white cursor-pointer ${stringify("border-transparent hover:border-[#FF4F00]")}`)}>Capture Production <span${attr_class(`text-[8px] transition-transform duration-200 ${stringify("")}`)}>▼</span></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (canSeeAdminPanel()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="relative"><button${attr_class(`text-[10px] font-black uppercase tracking-widest border-b-2 py-1 transition-all flex items-center gap-2 text-white cursor-pointer ${stringify("border-transparent hover:border-[#FF4F00]")}`)}>Admin Panel <span${attr_class(`text-[8px] transition-transform duration-200 ${stringify("")}`)}>▼</span></button> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="flex items-center gap-6"><button type="button" class="flex cursor-pointer flex-col items-end border-l border-gray-700 pl-6"><span class="text-[8px] font-black leading-none tracking-widest text-[#FF4F00] uppercase">Global Op Date</span> <span class="mt-0.5 font-mono text-[11px] font-bold text-white uppercase">${escape_html(activeDateStr())}</span></button> <input type="date" class="sr-only"${attr("value", activeDateStr())}/> `);
		if (user) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex items-center gap-3 border-l border-gray-700 pl-6"><div class="flex flex-col items-end select-none"><span class="text-[9px] font-black text-[#FF4F00] uppercase leading-none">${escape_html(user.role)}</span> <span class="text-[11px] font-bold text-white uppercase mt-0.5">${escape_html(user.username)}</span></div> <form method="POST" action="/logout"><button type="submit" aria-label="Cerrar Sesión" class="bg-gray-800 hover:bg-red-700 text-white p-2 transition-colors flex items-center justify-center cursor-pointer border border-gray-700 hover:border-red-600 shadow-md"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></form></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="border-l border-gray-700 pl-6"><a${attr("href", guestLoginHref())} class="text-[10px] font-black uppercase tracking-widest border-2 border-[#FF4F00] px-4 py-2 hover:bg-[#FF4F00] hover:text-white transition-all duration-150 inline-block">Access System</a></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div></nav> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/components/LoginModal.svelte
function LoginModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { next = ""} = $$props;
		let submitting = false;
		$$renderer.push(`<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 svelte-1y960i6"><div class="absolute inset-0 cursor-default bg-[#1A1A1A]/80 backdrop-blur-sm svelte-1y960i6"></div> <div class="relative z-10 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto border-4 border-[#1A1A1A] bg-white p-8 shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] svelte-1y960i6" role="dialog" aria-modal="true" aria-labelledby="terminal-login-title"><header class="mb-8 flex items-start justify-between gap-4 border-b-2 border-gray-100 pb-4 svelte-1y960i6"><div class="svelte-1y960i6"><span class="text-[10px] font-black tracking-[0.2em] text-[#FF4F00] uppercase svelte-1y960i6">Restricted Access</span> <h2 id="terminal-login-title" class="text-3xl font-black tracking-tighter text-[#1A1A1A] uppercase svelte-1y960i6">Terminal Login</h2></div> <button type="button" class="cursor-pointer text-[10px] font-black tracking-widest text-gray-400 uppercase hover:text-[#1A1A1A] svelte-1y960i6">Close</button></header> <form method="POST" action="/login" class="flex flex-col gap-6 svelte-1y960i6"><input type="hidden" name="next"${attr("value", next)} class="svelte-1y960i6"/> <div class="flex flex-col gap-2 svelte-1y960i6"><label for="login-username" class="text-[10px] font-black tracking-widest text-gray-400 uppercase svelte-1y960i6">Username / Employee ID</label> <input type="text" id="login-username" name="username" required="" autocomplete="username" placeholder="ENTER ID" class="w-full border-2 border-[#1A1A1A] bg-gray-50 px-4 py-3 text-sm font-bold uppercase outline-none transition-all focus:border-[#FF4F00] focus:bg-white svelte-1y960i6"/></div> <div class="flex flex-col gap-2 svelte-1y960i6"><label for="login-password" class="text-[10px] font-black tracking-widest text-gray-400 uppercase svelte-1y960i6">Security Code</label> <input type="password" id="login-password" name="password" required="" autocomplete="current-password" placeholder="••••••••" class="w-full border-2 border-[#1A1A1A] bg-gray-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-[#FF4F00] focus:bg-white svelte-1y960i6"/></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", submitting, true)} class="mt-4 w-full bg-[#1A1A1A] py-4 text-[11px] font-black tracking-[0.3em] text-white uppercase shadow-md transition-colors hover:bg-[#FF4F00] active:translate-y-1 disabled:bg-gray-300 svelte-1y960i6">${escape_html("Authorize Entry")}</button></form> <footer class="mt-8 text-center svelte-1y960i6"><p class="text-[9px] font-bold text-gray-400 uppercase italic svelte-1y960i6">Aptiv Operations Platform © ${escape_html((/* @__PURE__ */ new Date()).getFullYear())}</p></footer></div></div>`);
	});
}
//#endregion
//#region src/lib/assets/favicon.svg
var favicon_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3e%3ctitle%3eAPTIV-PLATFORM%3c/title%3e%3crect%20width='32'%20height='32'%20fill='%231A1A1A'/%3e%3crect%20width='6'%20height='32'%20fill='%23FF4F00'/%3e%3crect%20x='10'%20y='18'%20width='5'%20height='10'%20fill='%23FFFFFF'/%3e%3crect%20x='17'%20y='12'%20width='5'%20height='16'%20fill='%23FFFFFF'/%3e%3crect%20x='24'%20y='6'%20width='5'%20height='22'%20fill='%23FF4F00'/%3e%3c/svg%3e";
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		const prompted = derived(() => page.url.searchParams.get("login") === "1");
		const showLogin = derived(() => !data.user && (prompted() && true));
		const loginNext = derived(() => page.url.searchParams.get("next") || "");
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>APTIV-PLATFORM</title>`);
			});
			$$renderer.push(`<link rel="icon"${attr("href", favicon_default)} type="image/svg+xml"/>`);
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] font-sans text-[#1A1A1A]">`);
		Navbar($$renderer, {
			user: data.user,
			finishRoute: data.finishRoute
		});
		$$renderer.push(`<!----> <main>`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		if (showLogin()) {
			$$renderer.push("<!--[0-->");
			LoginModal($$renderer, {
				next: loginNext()});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-BiWpHuWP.js.map
