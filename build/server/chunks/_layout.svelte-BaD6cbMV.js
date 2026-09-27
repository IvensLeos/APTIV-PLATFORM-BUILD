import { R as head, S as attr, T as attr_class, U as escape_html, K as derived, V as stringify } from './dev-CorMzolj.js';
import { d as getOperationalDateStr } from './plantTime-RlOFrl7D.js';
import './client-C7VjdJoc.js';
import { p as page } from './state-CIeorGO9.js';
import './index-server-CQ5DdqbI.js';
import './internal-BJFHYuUe.js';
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
var favicon_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='107'%20height='128'%20viewBox='0%200%20107%20128'%3e%3ctitle%3esvelte-logo%3c/title%3e%3cpath%20d='M94.157%2022.819c-10.4-14.885-30.94-19.297-45.792-9.835L22.282%2029.608A29.92%2029.92%200%200%200%208.764%2049.65a31.5%2031.5%200%200%200%203.108%2020.231%2030%2030%200%200%200-4.477%2011.183%2031.9%2031.9%200%200%200%205.448%2024.116c10.402%2014.887%2030.942%2019.297%2045.791%209.835l26.083-16.624A29.92%2029.92%200%200%200%2098.235%2078.35a31.53%2031.53%200%200%200-3.105-20.232%2030%2030%200%200%200%204.474-11.182%2031.88%2031.88%200%200%200-5.447-24.116'%20style='fill:%23ff3e00'/%3e%3cpath%20d='M45.817%20106.582a20.72%2020.72%200%200%201-22.237-8.243%2019.17%2019.17%200%200%201-3.277-14.503%2018%2018%200%200%201%20.624-2.435l.49-1.498%201.337.981a33.6%2033.6%200%200%200%2010.203%205.098l.97.294-.09.968a5.85%205.85%200%200%200%201.052%203.878%206.24%206.24%200%200%200%206.695%202.485%205.8%205.8%200%200%200%201.603-.704L69.27%2076.28a5.43%205.43%200%200%200%202.45-3.631%205.8%205.8%200%200%200-.987-4.371%206.24%206.24%200%200%200-6.698-2.487%205.7%205.7%200%200%200-1.6.704l-9.953%206.345a19%2019%200%200%201-5.296%202.326%2020.72%2020.72%200%200%201-22.237-8.243%2019.17%2019.17%200%200%201-3.277-14.502%2017.99%2017.99%200%200%201%208.13-12.052l26.081-16.623a19%2019%200%200%201%205.3-2.329%2020.72%2020.72%200%200%201%2022.237%208.243%2019.17%2019.17%200%200%201%203.277%2014.503%2018%2018%200%200%201-.624%202.435l-.49%201.498-1.337-.98a33.6%2033.6%200%200%200-10.203-5.1l-.97-.294.09-.968a5.86%205.86%200%200%200-1.052-3.878%206.24%206.24%200%200%200-6.696-2.485%205.8%205.8%200%200%200-1.602.704L37.73%2051.72a5.42%205.42%200%200%200-2.449%203.63%205.79%205.79%200%200%200%20.986%204.372%206.24%206.24%200%200%200%206.698%202.486%205.8%205.8%200%200%200%201.602-.704l9.952-6.342a19%2019%200%200%201%205.295-2.328%2020.72%2020.72%200%200%201%2022.237%208.242%2019.17%2019.17%200%200%201%203.277%2014.503%2018%2018%200%200%201-8.13%2012.053l-26.081%2016.622a19%2019%200%200%201-5.3%202.328'%20style='fill:%23fff'/%3e%3c/svg%3e";
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${attr("href", favicon_default)}/>`);
		});
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] font-sans text-[#1A1A1A]">`);
		Navbar($$renderer, { user: data.user });
		$$renderer.push(`<!----> <main>`);
		children($$renderer);
		$$renderer.push(`<!----></main></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-BaD6cbMV.js.map
