import { a4 as escape_html, a7 as ensure_array_like, a2 as attr, a5 as attr_class, a6 as clsx$1, X as derived } from './dev-yuvcodp0.js';
import './client-KlLoW8e0.js';
import './internal-BRbcW4zN.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/users/+page.svelte
function rolePill($$renderer, role) {
	$$renderer.push(`<span${attr_class(clsx$1(["inline-block px-2 py-0.5 text-[9px] font-black tracking-wider uppercase", {
		"bg-[#FF4F00] text-white": role === "ADMIN",
		"bg-[#1A1A1A] text-white": role === "SUPERVISOR",
		"bg-gray-200 text-[#1A1A1A]": role === "OPERATOR",
		"border border-[#1A1A1A]": ![
			"ADMIN",
			"SUPERVISOR",
			"OPERATOR"
		].includes(role)
	}]))}>${escape_html(role)}</span>`);
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const ROLE_GUIDE = [
			{
				id: "ADMIN",
				title: "Administrator",
				reach: "Users, backup, plan, bypass",
				detail: "Full admin panel. Adds and removes accounts, restores a backup, uploads the daily plan, and turns an inventory bypass on or off."
			},
			{
				id: "SUPERVISOR",
				title: "Supervisor",
				reach: "Panel, except users and backup",
				detail: "Opens taxonomy, rates, failure review, scrapes, export, and logs. Cannot manage accounts, restore a backup, or upload the plan."
			},
			{
				id: "OPERATOR",
				title: "Operator",
				reach: "Nominal account",
				detail: "Does not open the admin panel. Floor review, dashboards, and the andon stay available without a login."
			}
		];
		let query = "";
		let roleFilter = "ALL";
		let selectedRole = "SUPERVISOR";
		let creating = false;
		const you = derived(() => data.user?.username || "");
		const term = derived(() => query.trim().toUpperCase());
		const chosen = derived(() => ROLE_GUIDE.find((role) => role.id === selectedRole) ?? ROLE_GUIDE[1]);
		const registerError = derived(() => form?.action === "register" ? form.error : "");
		const registered = derived(() => form?.action === "register" && form.success ? form : null);
		const removed = derived(() => form?.action === "delete" && form.success ? form : null);
		const deleteError = derived(() => form?.action === "delete" && form.error ? form.error : "");
		const counts = derived(() => {
			const tally = {
				ALL: data.users.length,
				ADMIN: 0,
				SUPERVISOR: 0,
				OPERATOR: 0
			};
			for (const user of data.users) if (tally[user.role] != null) tally[user.role] += 1;
			return tally;
		});
		const visible = derived(() => data.users.filter((user) => roleFilter === "ALL").filter((user) => !term() || `${user.username} ${user.name || ""} ${user.role}`.toUpperCase().includes(term())).slice().sort((a, b) => rank(a.role) - rank(b.role) || a.username.localeCompare(b.username)));
		function rank(role) {
			if (role === "ADMIN") return 0;
			if (role === "SUPERVISOR") return 1;
			if (role === "OPERATOR") return 2;
			return 9;
		}
		function formatCreated(value) {
			if (!value) return "—";
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return "—";
			return new Intl.DateTimeFormat("en-US", {
				timeZone: "America/Matamoros",
				month: "short",
				day: "2-digit",
				year: "numeric"
			}).format(date);
		}
		$$renderer.push(`<div class="min-h-screen bg-[#F4F4F4] p-6 md:p-8"><main class="mx-auto w-full max-w-7xl space-y-8"><header class="flex flex-col gap-4 border-b-4 border-[#1A1A1A] pb-6 lg:flex-row lg:items-end lg:justify-between"><div class="flex flex-col gap-2"><span class="block text-[9px] font-black tracking-widest text-[#FF4F00] uppercase">Access control</span> <h1 class="text-4xl font-black tracking-tighter text-[#1A1A1A] uppercase">User accounts</h1> <p class="max-w-3xl text-xs font-bold text-gray-500 uppercase">Only an administrator can add or remove accounts. Floor review does not use these logins. `);
		if (you()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`Signed in as <span class="text-[#1A1A1A]">${escape_html(you())}</span>.`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></p></div> <p class="font-mono text-5xl font-black tracking-tighter text-[#1A1A1A]">${escape_html(counts().ALL)} <span class="ml-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">${escape_html(counts().ALL === 1 ? "Account" : "Accounts")}</span></p></header> <section class="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Role access"><!--[-->`);
		const each_array = ensure_array_like(ROLE_GUIDE);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let role = each_array[$$index];
			$$renderer.push(`<button type="button"${attr("aria-pressed", roleFilter === role.id)}${attr_class(clsx$1(["cursor-pointer border bg-white p-5 text-left shadow-xl transition-colors", {
				"border-[#FF4F00] ring-2 ring-[#FF4F00]": roleFilter === role.id,
				"border-gray-200 hover:border-[#1A1A1A]": roleFilter !== role.id
			}]))}><div class="mb-3 flex items-start justify-between gap-3">`);
			rolePill($$renderer, role.id);
			$$renderer.push(`<!----> <span class="font-mono text-2xl font-black tracking-tighter text-[#1A1A1A]">${escape_html(counts()[role.id])}</span></div> <h2 class="text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">${escape_html(role.title)}</h2> <p class="mt-1 text-[10px] font-black tracking-wider text-[#FF4F00] uppercase">${escape_html(role.reach)}</p> <p class="mt-3 text-[11px] leading-relaxed font-bold text-gray-500">${escape_html(role.detail)}</p></button>`);
		}
		$$renderer.push(`<!--]--></section> `);
		if (removed()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="border-l-4 border-[#1A1A1A] bg-white px-4 py-3 text-[11px] font-black text-[#1A1A1A] uppercase">${escape_html(removed().username)} removed. That login no longer opens the panel.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (deleteError() && true) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-[11px] font-black text-red-700 uppercase">${escape_html(deleteError())}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-3"><section class="border border-gray-200 bg-white p-6 shadow-xl lg:sticky lg:top-6"><h2 class="mb-1 border-b-2 border-gray-100 pb-3 text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">New account</h2> <p class="mb-5 text-[10px] font-bold text-gray-400 uppercase">The employee ID is stored in uppercase and used at login.</p> <form method="POST" action="?/register" autocomplete="off" class="flex flex-col gap-4"><div class="flex flex-col gap-1"><label for="username" class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Employee ID</label> <input id="username" name="username" required="" autocomplete="off" placeholder="ILEOS" class="border border-gray-300 bg-gray-50 p-2.5 font-mono text-xs font-bold text-[#1A1A1A] uppercase outline-none focus:border-[#FF4F00]"/></div> <div class="flex flex-col gap-1"><label for="name" class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Full name</label> <input id="name" name="name" required="" autocomplete="off" placeholder="Name Surname" class="border border-gray-300 bg-gray-50 p-2.5 text-xs font-bold text-[#1A1A1A] uppercase outline-none focus:border-[#FF4F00]"/></div> <div class="flex flex-col gap-1"><label for="role" class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Role</label> `);
		$$renderer.select({
			id: "role",
			name: "role",
			value: selectedRole,
			class: "cursor-pointer border border-gray-300 bg-gray-50 p-2.5 text-xs font-bold text-[#1A1A1A] uppercase outline-none focus:border-[#FF4F00]"
		}, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(ROLE_GUIDE);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let role = each_array_1[$$index_1];
				$$renderer.option({ value: role.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(role.id)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(` <p class="text-[10px] leading-relaxed font-bold text-gray-500">${escape_html(chosen().detail)}</p></div> <div class="flex flex-col gap-1"><label for="password" class="text-[9px] font-black tracking-widest text-gray-400 uppercase">Initial password</label> <input id="password" name="password" type="password" required="" autocomplete="new-password" placeholder="••••••••" class="border border-gray-300 bg-gray-50 p-2.5 text-xs font-bold outline-none focus:border-[#FF4F00]"/> <p class="text-[10px] font-bold text-gray-400 uppercase">Stored as a salted hash. It is not shown again.</p></div> `);
		if (registerError()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="border-l-4 border-red-600 bg-red-50 px-3 py-2 text-[10px] font-black text-red-700 uppercase">${escape_html(registerError())}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (registered()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="border-l-4 border-green-600 bg-green-50 px-3 py-2 text-[10px] font-black text-green-800 uppercase">${escape_html(registered().username)} created as ${escape_html(registered().role)}.</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button${attr("disabled", creating, true)} class="cursor-pointer bg-[#1A1A1A] py-3 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-[#FF4F00] disabled:cursor-wait disabled:bg-gray-300">${escape_html("Create account")}</button></form></section> <section class="border border-gray-200 bg-white shadow-xl lg:col-span-2"><div class="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-end sm:justify-between"><div><h2 class="text-[11px] font-black tracking-widest text-[#1A1A1A] uppercase">Directory</h2> <p class="mt-1 text-[10px] font-bold text-gray-400 uppercase">${escape_html(visible().length)} of ${escape_html(counts().ALL)} `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></p></div> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Search <input${attr("value", query)} class="w-full border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-[#1A1A1A] uppercase outline-none focus:border-[#FF4F00] sm:w-64" placeholder="ID or name"/></label></div> <div class="overflow-x-auto"><table class="w-full min-w-[640px] border-collapse text-left"><thead><tr class="bg-[#1A1A1A] text-[9px] font-black tracking-wider text-white uppercase"><th class="p-3">Employee ID</th><th class="p-3">Name</th><th class="p-3">Role</th><th class="p-3">Created</th><th class="p-3 text-right">Access</th></tr></thead><tbody class="divide-y divide-gray-100 text-[11px]">`);
		const each_array_2 = ensure_array_like(visible());
		if (each_array_2.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let user = each_array_2[$$index_2];
				const isYou = user.username === you();
				$$renderer.push(`<tr${attr_class(clsx$1(isYou ? "bg-orange-50/70" : "hover:bg-gray-50"))}><td class="p-3 font-mono font-black text-[#FF4F00]">${escape_html(user.username)} `);
				if (isYou) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="ml-2 text-[8px] font-black tracking-widest text-[#1A1A1A] uppercase">You</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></td><td class="p-3 font-bold text-[#1A1A1A] uppercase">${escape_html(user.name || "—")}</td><td class="p-3">`);
				rolePill($$renderer, user.role);
				$$renderer.push(`<!----></td><td class="p-3 font-mono text-gray-500">${escape_html(formatCreated(user.createdAt))}</td><td class="p-3 text-right">`);
				if (isYou) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-[9px] font-black tracking-wider text-gray-400 uppercase">Signed in</span>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<button type="button" class="cursor-pointer text-[9px] font-black tracking-wider text-gray-400 uppercase hover:text-red-600">Remove</button>`);
				}
				$$renderer.push(`<!--]--></td></tr>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<tr><td colspan="5" class="p-8 text-center text-[10px] font-bold text-gray-400 uppercase">`);
			if (data.users.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`No accounts yet.`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`No accounts match this view.`);
			}
			$$renderer.push(`<!--]--></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></section></div></main></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BEWG--F7.js.map
