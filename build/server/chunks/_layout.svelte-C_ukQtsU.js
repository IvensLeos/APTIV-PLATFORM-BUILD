import { a1 as head, a2 as attr, a3 as stringify, a4 as escape_html, X as derived, a5 as attr_class, a6 as clsx$1, a7 as ensure_array_like } from './dev-yuvcodp0.js';
import { b as getOperationalDateStr } from './plantTime-C6hdc3to.js';
import { i as isFinishProcess, b as isBuildProcess } from './plantAreas-DImca8Fn.js';
import './client-Ck4Ac6hg.js';
import { p as page } from './state-DBx2-N50.js';
import './shifts-BYGd7DZC.js';
import './internal-EKkdDKPi.js';
import './index-DBqjc0Yf.js';

//#endregion
//#region src/lib/components/Navbar.svelte
function logoutButton($$renderer, onDark) {
	$$renderer.push(`<form method="POST" action="/logout"><button type="submit" aria-label="Sign out"${attr_class(clsx$1(["flex cursor-pointer items-center justify-center border p-2 transition-colors", "border-white/20 bg-white/5 text-white hover:border-red-500 hover:bg-red-700" ]))}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></form>`);
}
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user = null} = $$props;
		let openMenu = null;
		let mobileOpen = false;
		const canSeeAdminPanel = derived(() => !!user && ["SUPERVISOR", "ADMIN"].includes(user.role));
		const activeDateStr = derived(() => page.url.searchParams.get("date") || getOperationalDateStr());
		const plantArea = derived(() => {
			if (page.url.searchParams.get("area") === "finish") return "FINISH";
			const parts = page.url.pathname.split("/").filter(Boolean);
			if ((parts[0] === "review" || parts[0] === "dashboard") && parts[1]) {
				const name = parts[1].toUpperCase().replace(/-/g, " ");
				if (isFinishProcess(name) && !isBuildProcess(name)) return "FINISH";
			}
			return "BUILD";
		});
		const onDashboards = derived(() => page.url.pathname.startsWith("/dashboard"));
		const onReview = derived(() => page.url.pathname.startsWith("/review"));
		const onAdmin = derived(() => page.url.pathname.startsWith("/admin"));
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
		function areaSwitch($$renderer) {
			$$renderer.push(`<div class="flex shrink-0 border border-white/25"><!--[-->`);
			const each_array = ensure_array_like(["BUILD", "FINISH"]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let area = each_array[$$index];
				$$renderer.push(`<button type="button"${attr("aria-pressed", plantArea() === area)}${attr_class(clsx$1(["cursor-pointer px-2.5 py-1 text-[10px] font-black tracking-widest uppercase sm:px-3", {
					"border-l border-white/25": area === "FINISH",
					"bg-[#FF4F00] text-white": plantArea() === area,
					"text-gray-400 hover:text-white": plantArea() !== area
				}]))}>${escape_html(area === "BUILD" ? "Build" : "Finish")}</button>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		function menuButton($$renderer, id, label, shortLabel, active) {
			$$renderer.push(`<button type="button"${attr("aria-expanded", openMenu === id)}${attr_class(clsx$1(["flex cursor-pointer items-center gap-1.5 border-b-2 py-1 text-[10px] font-black tracking-widest uppercase", openMenu === id || active ? "border-[#FF4F00] text-[#FF4F00]" : "border-transparent text-white hover:border-white/40"]))}><span class="xl:hidden">${escape_html(shortLabel)}</span> <span class="hidden xl:inline">${escape_html(label)}</span> <svg${attr_class(clsx$1(["h-2.5 w-2.5 transition-transform", openMenu === id && "rotate-180"]))} viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 4.5 6 8l4-3.5"></path></svg></button>`);
		}
		$$renderer.push(`<nav class="relative z-50 bg-[#1A1A1A] font-sans text-white"><div class="border-b-4 border-[#FF4F00]"><div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3"><a${attr("href", getUrl("/", getOperationalDateStr()))} class="flex min-w-0 items-center gap-3 hover:opacity-90"><span class="bg-[#FF4F00] px-2.5 py-1 text-sm font-black tracking-tighter text-white select-none">APTIV</span> <span class="hidden leading-none lg:block"><span class="block text-[11px] font-black tracking-widest uppercase">OEE</span> <span class="mt-0.5 hidden text-[8px] font-bold tracking-widest text-gray-400 uppercase xl:block">Real-time monitoring</span></span></a> <div class="hidden items-center gap-5 lg:flex"><div class="relative">`);
		menuButton($$renderer, "dashboards", "Live dashboards", "Dashboards", onDashboards());
		$$renderer.push(`<!----> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="relative">`);
		menuButton($$renderer, "review", "Review production", "Review", onReview());
		$$renderer.push(`<!----> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		if (canSeeAdminPanel()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="relative">`);
			menuButton($$renderer, "admin", "Admin panel", "Admin", onAdmin());
			$$renderer.push(`<!----> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="ml-auto flex items-center gap-2 sm:gap-3">`);
		areaSwitch($$renderer);
		$$renderer.push(`<!----> <button type="button"${attr("aria-label", `Operating date ${stringify(activeDateStr())}`)} class="flex cursor-pointer flex-col items-end px-1.5 py-1 hover:bg-white/10"><span class="text-[8px] leading-none font-black tracking-widest text-[#FF4F00] uppercase">Op date</span> <span class="mt-0.5 font-mono text-[11px] font-bold text-white">${escape_html(activeDateStr())}</span></button> <input type="date" class="sr-only"${attr("value", activeDateStr())}/> <div class="hidden items-center gap-3 border-l border-white/15 pl-3 lg:flex">`);
		if (user) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex flex-col items-end select-none"><span class="text-[9px] leading-none font-black text-[#FF4F00] uppercase">${escape_html(user.role)}</span> <span class="mt-0.5 text-[11px] font-bold uppercase">${escape_html(user.username)}</span></div> `);
			logoutButton($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a${attr("href", guestLoginHref())} class="border-2 border-[#FF4F00] px-3 py-1.5 text-[10px] font-black tracking-widest uppercase hover:bg-[#FF4F00]">Access system</a>`);
		}
		$$renderer.push(`<!--]--></div> <button type="button" class="flex cursor-pointer items-center justify-center border border-white/25 p-2 lg:hidden"${attr("aria-expanded", mobileOpen)}${attr("aria-label", "Open menu")}><svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"></path>`);
		$$renderer.push(`<!--]--></svg></button></div></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></nav> `);
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
//# sourceMappingURL=_layout.svelte-C_ukQtsU.js.map
