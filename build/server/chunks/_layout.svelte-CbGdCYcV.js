import { R as head, S as attr, T as attr_class, U as escape_html, K as derived, V as stringify } from './dev-CorMzolj.js';
import { d as getOperationalDateStr } from './plantTime-RlOFrl7D.js';
import './client-7pnEKwh9.js';
import { p as page } from './state-DO4A7U1L.js';
import './index-server-CQ5DdqbI.js';
import './internal-FoTrLbld.js';
import './index-DBqjc0Yf.js';

//#region src/lib/components/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user = null } = $$props;
		const getCurrentOperativeDay = () => getOperationalDateStr();
		const canSeeAdminPanel = derived(() => !!user && ["SUPERVISOR", "ADMIN"].includes(user.role));
		const activeDateStr = derived(() => page.url.searchParams.get("date") || getCurrentOperativeDay());
		function getUrl(path, customDate) {
			return `${path}${path.includes("?") ? "&" : "?"}date=${customDate || activeDateStr()}`;
		}
		$$renderer.push(`<nav class="bg-[#1A1A1A] text-white p-4 shadow-xl border-b-4 border-[#FF4F00] w-full relative z-50 font-sans"><div class="max-w-7xl mx-auto flex justify-between items-center"><a${attr("href", getUrl("/", getCurrentOperativeDay()))} class="flex items-center gap-4 hover:opacity-90 transition-opacity"><div class="bg-[#FF4F00] text-white font-black px-3 py-1 text-xl tracking-tighter select-none">APTIV</div> <div class="h-6 w-[1px] bg-gray-600 hidden md:block"></div> <h1 class="text-sm md:text-lg font-bold tracking-widest uppercase opacity-90">OEE Real-Time Monitoring</h1></a> <div class="flex items-center gap-6"><div class="relative"><button${attr_class(`text-[10px] font-black uppercase tracking-widest border-b-2 py-1 transition-all flex items-center gap-2 text-white cursor-pointer ${stringify("border-transparent hover:border-[#FF4F00]")}`)}>Live Dashboards <span${attr_class(`text-[8px] transition-transform duration-200 ${stringify("")}`)}>▼</span></button> `);
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
			$$renderer.push(`<div class="border-l border-gray-700 pl-6"><a${attr("href", getUrl("/login"))} class="text-[10px] font-black uppercase tracking-widest border-2 border-[#FF4F00] px-4 py-2 hover:bg-[#FF4F00] hover:text-white transition-all duration-150 inline-block">Access System</a></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div></nav> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
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
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>APTIV-PLATFORM</title>`);
			});
			$$renderer.push(`<link rel="icon"${attr("href", favicon_default)} type="image/svg+xml"/>`);
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] font-sans text-[#1A1A1A]">`);
		Navbar($$renderer, { user: data.user });
		$$renderer.push(`<!----> <main>`);
		children($$renderer);
		$$renderer.push(`<!----></main></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-CbGdCYcV.js.map
