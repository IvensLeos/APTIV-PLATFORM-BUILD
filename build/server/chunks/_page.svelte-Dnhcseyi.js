import { U as escape_html, S as attr, a7 as ensure_array_like } from './dev-CorMzolj.js';
import './client-dlNO_7_v.js';
import './index-server-CQ5DdqbI.js';
import './internal-CsYZTDuX.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/users/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let isLoading = false;
		$$renderer.push(`<div class="p-8 max-w-6xl mx-auto"><header class="flex flex-col gap-2 border-b-4 border-[#1A1A1A] pb-6 mb-8"><span class="text-[9px] font-black text-[#FF4F00] uppercase tracking-widest block">System Administration</span> <h1 class="text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">User Management</h1></header> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><section class="bg-white border-2 border-[#1A1A1A] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]"><h3 class="text-[11px] font-black uppercase mb-6 border-b-2 border-gray-100 pb-2">Register New Employee</h3> <form method="POST" action="?/register" class="flex flex-col gap-4"><div class="flex flex-col gap-1"><label for="username" class="text-[9px] font-black text-gray-400 uppercase">Employee ID (Username)</label> <input id="username" name="username" required="" placeholder="EX: ILEOS" class="bg-gray-50 border-2 border-gray-200 p-2 text-xs font-bold uppercase focus:border-[#FF4F00] outline-none transition-colors"/></div> <div class="flex flex-col gap-1"><label for="name" class="text-[9px] font-black text-gray-400 uppercase">Full Name</label> <input id="name" name="name" required="" placeholder="NAME SURNAME" class="bg-gray-50 border-2 border-gray-200 p-2 text-xs font-bold focus:border-[#FF4F00] outline-none transition-colors"/></div> <div class="flex flex-col gap-1"><label for="role" class="text-[9px] font-black text-gray-400 uppercase">System Role</label> <select id="role" name="role" class="bg-gray-50 border-2 border-gray-200 p-2 text-xs font-bold uppercase focus:border-[#FF4F00] outline-none cursor-pointer">`);
		$$renderer.option({ value: "OPERATOR" }, ($$renderer) => {
			$$renderer.push(`OPERATOR`);
		});
		$$renderer.option({ value: "SUPERVISOR" }, ($$renderer) => {
			$$renderer.push(`SUPERVISOR`);
		});
		$$renderer.option({ value: "ADMIN" }, ($$renderer) => {
			$$renderer.push(`ADMINISTRATOR`);
		});
		$$renderer.push(`</select></div> <div class="flex flex-col gap-1"><label for="password" class="text-[9px] font-black text-gray-400 uppercase">Initial Password</label> <input id="password" name="password" type="password" required="" placeholder="••••••••" class="bg-gray-50 border-2 border-gray-200 p-2 text-xs font-bold focus:border-[#FF4F00] outline-none transition-colors"/></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-red-50 border-l-4 border-red-600 p-2 animate-pulse"><p class="text-[9px] font-black text-red-600 uppercase">${escape_html(form.error)}</p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.success) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-green-50 border-l-4 border-green-600 p-2"><p class="text-[9px] font-black text-green-600 uppercase">User created successfully</p></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button${attr("disabled", isLoading, true)} class="bg-[#1A1A1A] text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4F00] disabled:bg-gray-300 transition-all active:scale-95 shadow-md">${escape_html("Authorize & Create")}</button></form></section> <section class="lg:col-span-2 bg-white border-2 border-gray-200 p-6 shadow-sm relative"><h3 class="text-[11px] font-black uppercase mb-6 border-b-2 border-gray-100 pb-2">Active Directory</h3> <div class="overflow-x-auto"><table class="w-full text-left border-collapse"><thead><tr class="border-b-2 border-[#1A1A1A]"><th class="py-3 text-[10px] font-black uppercase text-gray-400">ID</th><th class="py-3 text-[10px] font-black uppercase text-gray-400">Full Name</th><th class="py-3 text-[10px] font-black uppercase text-gray-400 text-center">Role</th><th class="py-3 text-[10px] font-black uppercase text-gray-400 text-right">Actions</th></tr></thead><tbody class="divide-y divide-gray-100"><!--[-->`);
		const each_array = ensure_array_like(data.users);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let user = each_array[$$index];
			$$renderer.push(`<tr class="hover:bg-gray-50 transition-colors group"><td class="py-3 text-[11px] font-black text-[#FF4F00]">${escape_html(user.username)}</td><td class="py-3 text-[11px] font-bold text-[#1A1A1A] uppercase">${escape_html(user.name)}</td><td class="py-3 text-center"><span class="text-[8px] font-black px-2 py-0.5 border-2 border-[#1A1A1A]">${escape_html(user.role)}</span></td><td class="py-3 text-right"><button class="text-[9px] font-black text-gray-400 hover:text-red-600 uppercase tracking-tighter transition-colors">[ Terminate Access ]</button></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Dnhcseyi.js.map
