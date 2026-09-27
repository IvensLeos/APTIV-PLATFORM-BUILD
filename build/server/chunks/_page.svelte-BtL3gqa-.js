import { U as escape_html, a7 as ensure_array_like, S as attr, V as stringify, T as attr_class, a9 as clsx$1, a6 as attr_style, K as derived, a8 as bind_props } from './dev-CorMzolj.js';
import { b as buildTimeline } from './plantTime-RlOFrl7D.js';
import { f as formatQty, g as getRefinedDate, d as displayHourToken, l as liveHourToken, a as formatToDBSlashDate, i as isIntervalInFuture, e as extractHourMinute } from './captureFormat-FFTiojiT.js';
import { p as page } from './state-DyO2y5dA.js';
import './client-ByYMSKKg.js';
import './index-server-CQ5DdqbI.js';
import './internal-C0ucU1d4.js';
import './index-DBqjc0Yf.js';

//#region src/lib/familyGroups.js
var ECU_BOX = /^ECU BOX ([A-Z])\b/i;
var CADM_MID = /^CADM MID\b/i;
var CADM_MAP = /^CADM MAP\b/i;
function familyFilterKey(family, type, serverProcess) {
	const name = family || "UNKNOWN";
	let key = name;
	if (!type || type === "CONTROLLER") if (/\bBOARD$/i.test(name)) key = name;
	else {
		const box = String(name).match(ECU_BOX);
		if (box) key = `ECU BOX ${box[1].toUpperCase()}`;
		else if (CADM_MID.test(name)) key = "CADM MID";
		else if (CADM_MAP.test(name)) key = "CADM MAP";
	}
	if (String(serverProcess || "").includes("SPI_S2")) return `${key} (2)`;
	return key;
}
function familyMatchesFilter(family, filter, type, serverProcess) {
	return true;
}
//#endregion
//#region src/lib/components/Toast.svelte
function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/components/capture/ShiftFilter.svelte
function ShiftFilter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { active = "ALL" } = $$props;
		const shifts = [
			"ALL",
			"T09",
			"T25",
			"T08"
		];
		$$renderer.push(`<div class="flex gap-2 mt-4"><!--[-->`);
		const each_array = ensure_array_like(shifts);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let shift = each_array[$$index];
			$$renderer.push(`<button${attr_class(`cursor-pointer border-2 px-4 py-1 text-[10px] font-black transition-all ${stringify(active === shift ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-400 hover:border-orange-600")}`)}>${escape_html(shift)}</button>`);
		}
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { active });
	});
}
//#endregion
//#region src/lib/components/capture/IntervalTable.svelte
function IntervalTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { rows, isReadOnly, liveToken} = $$props;
		let openHours = {};
		function blockExtras(index) {
			const id = rows[index]?.DISPLAY_ID;
			let count = 0;
			for (let i = index + 1; i < rows.length && rows[i].DISPLAY_ID === id; i++) count += 1;
			return count;
		}
		$$renderer.push(`<div class="overflow-x-auto border border-zinc-200 bg-white shadow-xl"><table class="w-full min-w-[1280px] table-fixed border-collapse text-left"><colgroup><col class="w-[176px]"/><col class="w-[112px]"/><col class="w-[256px]"/><col class="w-20"/><col class="w-20"/><col class="w-20"/><col class="w-20"/><col class="w-20"/><col/><col/></colgroup><thead><tr class="bg-zinc-900 text-[9px] font-black tracking-wider text-white uppercase"><th class="border-r border-zinc-800 p-3">Datetime</th><th class="border-r border-zinc-800 p-3 text-center">Part Number</th><th class="border-r border-zinc-800 p-3 text-center text-orange-400">Family</th><th class="border-r border-zinc-800 p-3 text-center text-zinc-400">Rate</th><th class="border-r border-zinc-800 p-3 text-center text-blue-400">Produced</th><th class="border-r border-zinc-800 p-3 text-center text-red-400">Fail</th><th class="border-r border-zinc-800 p-3 text-center text-zinc-400">Run Time</th><th class="border-r border-zinc-800 p-3 text-center text-red-400">Lost Time</th><th class="border-r border-zinc-800 p-3">Failure Code</th><th class="p-3">Comments</th></tr></thead><tbody class="divide-y divide-zinc-200 font-sans text-[11px]"><!--[-->`);
		const each_array = ensure_array_like(rows);
		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let row = each_array[index];
			const d = getRefinedDate(row.DISPLAY_ID);
			const isFirstOfHour = index === 0 || rows[index - 1].DISPLAY_ID !== row.DISPLAY_ID;
			const extras = isFirstOfHour ? blockExtras(index) : 0;
			const isLiveInterval = !isReadOnly && displayHourToken(row.DISPLAY_ID) === liveToken;
			if (isFirstOfHour || openHours[row.DISPLAY_ID]) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<tr${attr_class(`border-l-4 transition-colors hover:bg-zinc-50/80 ${stringify(isFirstOfHour ? "border-transparent hover:border-orange-600" : "border-dashed border-zinc-300 bg-zinc-50/30 hover:border-zinc-400")} ${stringify(row.IS_GHOST ? "italic opacity-60" : "")}`)}><td class="relative overflow-hidden border-r border-zinc-100 bg-zinc-50/50 p-2 whitespace-nowrap">`);
				if (isFirstOfHour) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="flex items-center gap-2"><div class="flex flex-col leading-tight"><span class="text-[9px] font-black tracking-tighter text-orange-600 italic">${escape_html(d.day)}</span> <span class="text-[9px] font-black tracking-tighter text-zinc-400">${escape_html(d.month)} ${escape_html(d.num)}</span></div> <div class="h-4 w-px bg-zinc-200"></div> <div class="flex items-baseline gap-0.5"><span class="text-[14px] leading-none font-black tracking-tighter text-zinc-900 italic tabular-nums">${escape_html(d.time)}</span> <span class="text-[9px] font-black tracking-tighter text-zinc-400">${escape_html(d.period)}</span></div> `);
					if (extras > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button type="button" class="cursor-pointer text-[9px] font-black text-orange-600">${escape_html(openHours[row.DISPLAY_ID] ? "▼" : "▶")} ${escape_html(extras)}</button>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="flex h-full items-center gap-2 pl-6"><div class="absolute top-0 bottom-0 left-4 w-0.5 border-l border-dashed border-zinc-300"></div> <span class="animate-pulse rounded-xs border border-orange-200 bg-orange-100 px-1.5 py-0.5 font-sans text-[8px] font-black tracking-wider text-orange-700 uppercase">↳ CHANGEOVER DETECTED</span></div>`);
				}
				$$renderer.push(`<!--]--></td><td class="relative border-r border-zinc-100 p-2 text-center">`);
				if (row.REQUIRES_PART && !isReadOnly) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="flex flex-col items-center gap-1"><input type="text" list="master-parts-list" placeholder="SEARCH PART..." class="w-full border-2 border-orange-400 bg-orange-50 p-1 text-center text-[10px] font-black uppercase outline-none transition-colors placeholder:text-orange-300 focus:bg-white"${attr("name", `part-input-${row.IDENTIFIER}`)}/> <span class="animate-pulse text-[7px] font-bold text-orange-500">REQUIRED</span></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="flex flex-col"><span class="font-mono text-xs font-bold text-zinc-900">${escape_html(row.PARTNUMBER)}</span> `);
					if (row.IS_GHOST) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-[8px] font-bold tracking-tighter text-blue-500 uppercase">INHERITED</span>`);
					} else if (row.SERVER_SOURCE === "MANUAL_ENTRY") {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<span class="text-[8px] font-bold tracking-tighter text-orange-500 uppercase">MANUAL ENTRY</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-zinc-900 uppercase"${attr("title", `${row.FAMILY || "-"} ${row?.SERVER_PROCESS?.toString()?.includes("SPI_S2") ? "(2)" : ""}`.trim())}>${escape_html(`${row.FAMILY || "-"} ${row?.SERVER_PROCESS?.toString()?.includes("SPI_S2") ? "(2)" : ""}`)}</td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-zinc-400">${escape_html(formatQty(row.RATE))}</td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs font-bold text-blue-600">${escape_html(formatQty(row.PRODUCED))}</td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-red-600">${escape_html(formatQty(row.QUALITY?.fail))}</td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-zinc-400 italic"><span${attr_class(clsx$1(!isFirstOfHour ? "font-bold text-orange-600" : ""))}>${escape_html(formatQty(row.DURATION))}m</span></td><td${attr_class(`border-r border-zinc-100 p-2 text-center font-mono text-xs font-black ${stringify(row.TIME_LOST > 0 ? "bg-red-50 text-red-600" : "text-zinc-200")}`)}>${escape_html(formatQty(row.TIME_LOST))}m</td><td class="border-r border-zinc-100 p-1"><button${attr("disabled", row.TIME_LOST <= 0 || isLiveInterval, true)}${attr_class(`flex h-10 w-full items-center justify-between rounded-xs px-3 text-[10px] font-black uppercase transition-all ${stringify(isLiveInterval ? "cursor-not-allowed border-l-4 border-zinc-300 bg-zinc-100 text-zinc-400 select-none" : row.TIME_LOST > 0 ? "cursor-pointer border-l-4 border-red-600 bg-red-50 text-red-700 hover:bg-red-100/70" : "cursor-pointer bg-zinc-50 text-zinc-400")}`)}><span class="truncate pr-2 text-left">`);
				if (isLiveInterval) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`🔒 WAITING FOR INTERVAL END...`);
				} else if (Array.isArray(row.TIME_LOST_COMMENT)) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`${escape_html(row.TIME_LOST_COMMENT.filter((f) => f.code && f.minutes > 0).map((f) => `${formatQty(f.minutes)}' ${f.code}`).join(", ") || (row.TIME_LOST > 0 ? "⚠️ NEED FAILURE" : "---"))}`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`${escape_html(row.TIME_LOST > 0 ? row.TIME_LOST_COMMENT || "⚠️ NEED FAILURE" : "---")}`);
				}
				$$renderer.push(`<!--]--></span></button></td><td class="p-1"><input${attr("id", `comment-input-${stringify(row.IDENTIFIER)}`)} type="text"${attr("value", isLiveInterval ? "" : row.COMMENTS)}${attr("disabled", isReadOnly || row.IS_LOCKED || isLiveInterval, true)}${attr_class(`w-full rounded-xs border-0 bg-transparent p-2 text-[10px] font-bold uppercase outline-hidden transition-colors ${stringify(isReadOnly || row.IS_LOCKED || isLiveInterval ? "cursor-not-allowed bg-zinc-50 italic opacity-40" : "focus:bg-zinc-50")}`)}${attr("placeholder", isLiveInterval ? "🔒 WAITING FOR INTERVAL END..." : row.IS_LOCKED ? "INTERVAL LOCKED..." : "ADD NOTE...")}${attr("name", `comment-input-${row.IDENTIFIER}`)}/></td></tr>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></tbody></table></div>`);
	});
}
//#endregion
//#region src/routes/capture/[process]/[machine]/+page.svelte
var persistedShift = "ALL";
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const activeMachine = derived(() => (page.params.machine || "").toUpperCase());
		const failureCodes = derived(() => data.failureCodes || []);
		let isAndonActive = false;
		let activeShift = persistedShift;
		let filterFamily = "ALL";
		let updatedLogsOverride = [];
		const reactiveLogs = derived(() => {
			const baseLogs = data.logs || [];
			const overrideMap = new Map(updatedLogsOverride.map((log) => [log.IDENTIFIER, log]));
			return baseLogs.map((serverLog) => {
				if (overrideMap.has(serverLog.IDENTIFIER)) {
					const updated = overrideMap.get(serverLog.IDENTIFIER);
					overrideMap.delete(serverLog.IDENTIFIER);
					return updated;
				}
				return serverLog;
			}).concat(Array.from(overrideMap.values()));
		});
		const entries = derived(() => {
			if (!reactiveLogs()) return [];
			const reconstructed = [];
			const dBSlashDate = formatToDBSlashDate(data.selectedDate);
			let lastValidRunningJob = {
				PARTNUMBER: "-",
				FAMILY: "N/A",
				BASE_RATE: 0,
				LEVEL: "N/A",
				TYPE: "N/A",
				PROCESS: data.processName,
				STATION: data.logs[0]?.STATION || data.defaultStationCode || ""
			};
			timelineTemplate().forEach((slot) => {
				if (isIntervalInFuture(dBSlashDate, slot.time)) return;
				const matches = reactiveLogs().filter((log) => extractHourMinute(log.DISPLAY_ID) === slot.time);
				if (matches.length > 0) {
					if (matches.length > 1) matches.sort((a, b) => a.PARTNUMBER === lastValidRunningJob.PARTNUMBER ? -1 : b.PARTNUMBER === lastValidRunningJob.PARTNUMBER ? 1 : 0);
					let remainingMinutes = slot.duration;
					matches.forEach((row, idx) => {
						if (row.PARTNUMBER && row.PARTNUMBER !== "-") {
							const rowDuration = Number(row.DURATION) || slot.duration || 60;
							const normalizedHourlyRate = Math.round(Number(row.RATE) / rowDuration * 60);
							lastValidRunningJob = {
								PARTNUMBER: row.PARTNUMBER,
								FAMILY: row.FAMILY || "N/A",
								BASE_RATE: normalizedHourlyRate || Number(row.RATE) || 0,
								DURATION: rowDuration,
								LEVEL: row.LEVEL || "N/A",
								TYPE: row.TYPE || "N/A",
								PROCESS: row.PROCESS || data.processName,
								STATION: row.STATION || lastValidRunningJob.STATION
							};
						}
						const finalDuration = row.DURATION !== void 0 && row.DURATION !== null ? Number(row.DURATION) : idx === matches.length - 1 ? Math.max(0, remainingMinutes) : Math.min(Math.floor(Number(row.PRODUCED) * 60 / (Number(row.RATE) || lastValidRunningJob.BASE_RATE || 1)) || 0, remainingMinutes);
						remainingMinutes -= finalDuration;
						const finalRate = row.RATE !== void 0 && row.RATE !== null ? Number(row.RATE) : Math.floor((Number(row.RATE) || lastValidRunningJob.BASE_RATE) / 60 * finalDuration) || 0;
						reconstructed.push({
							...row,
							RATE: finalRate,
							CALCULATED_SHIFT: slot.shift,
							DURATION: finalDuration,
							TIME_LOST: Number(row.TIME_LOST) !== void 0 ? Number(row.TIME_LOST) : 0,
							SERVER_SOURCE: row.SERVER_SOURCE || "MANUAL_ENTRY",
							SERVER_PROCESS: row.SERVER_PROCESS || (row.PROCESS || data.processName).toUpperCase(),
							IS_GHOST: false,
							IS_LOCKED: false
						});
					});
				} else {
					const timeWithSeconds = slot.time.replace(/\s/g, "").replace(/(AM|PM)/i, ":00$1");
					const [dBSlashMonth, dBSlashDay, dBSlashYear] = dBSlashDate.split("/");
					const formattedDatePart = `${dBSlashYear}${dBSlashMonth.padStart(2, "0")}${dBSlashDay.padStart(2, "0")}`;
					const isPM = timeWithSeconds.toUpperCase().includes("PM");
					const isAM = timeWithSeconds.toUpperCase().includes("AM");
					const [rawHour, rawMinute] = timeWithSeconds.replace(/[AM|PM|UTC\s]/gi, "").split(":");
					let hourNumber = parseInt(rawHour, 10);
					if (isPM && hourNumber < 12) hourNumber += 12;
					if (isAM && hourNumber === 12) hourNumber = 0;
					const formattedTimePart = `${String(hourNumber).padStart(2, "0")}${rawMinute.padStart(2, "0")}`;
					const IDENTIFIER = `MANUAL_ENTRY_${activeMachine()}_${lastValidRunningJob.PARTNUMBER}_${formattedDatePart}_${formattedTimePart}`;
					reconstructed.push({
						_id: null,
						IDENTIFIER,
						DISPLAY_ID: `${dBSlashDate} ${timeWithSeconds} UTC`,
						MACHINE: activeMachine(),
						PARTNUMBER: lastValidRunningJob.PARTNUMBER,
						FAMILY: lastValidRunningJob.FAMILY,
						LEVEL: lastValidRunningJob.LEVEL,
						TYPE: lastValidRunningJob.TYPE,
						PROCESS: lastValidRunningJob.PROCESS || data.processName,
						STATION: lastValidRunningJob.STATION,
						RATE: Math.round(lastValidRunningJob.BASE_RATE / 60 * slot.duration),
						PRODUCED: 0,
						DURATION: slot.duration,
						TIME_LOST: slot.duration,
						CALCULATED_SHIFT: slot.shift,
						TIME_LOST_COMMENT: "",
						COMMENTS: "",
						REQUIRES_PART: lastValidRunningJob.PARTNUMBER === "-",
						SERVER_SOURCE: "MANUAL_ENTRY",
						SERVER_PROCESS: (lastValidRunningJob.PROCESS || data.processName).toUpperCase(),
						IS_GHOST: true,
						IS_LOCKED: false
					});
				}
			});
			return reconstructed;
		});
		const timelineTemplate = derived(() => buildTimeline(!!data.isSpecialDay));
		const shiftSlots = derived(() => activeShift === "ALL" ? timelineTemplate() : timelineTemplate().filter((slot) => slot.shift === activeShift));
		const liveToken = derived(() => {
			data.selectedDate;
			return liveHourToken();
		});
		const stats = derived(() => {
			const completedEntries = entries().filter((e) => {
				const matchesShift = activeShift === "ALL" || e.CALCULATED_SHIFT === activeShift;
				const matchesFamily = familyMatchesFilter(e.FAMILY, filterFamily, e.TYPE, e.SERVER_PROCESS);
				return matchesShift && matchesFamily && !e.IS_LOCKED;
			});
			const totalProduced = completedEntries.reduce((acc, curr) => acc + (Number(curr.PRODUCED) || 0), 0);
			const totalExpected = completedEntries.reduce((acc, curr) => acc + (Number(curr.RATE) || 0), 0);
			const totalLost = completedEntries.reduce((acc, curr) => acc + (Number(curr.TIME_LOST) || 0), 0);
			const totalRunTime = completedEntries.reduce((acc, curr) => acc + (Number(curr.DURATION) || 0), 0);
			const lostPieces = completedEntries.reduce((acc, curr) => {
				return acc + (Number(curr.RATE) || 0) / (Number(curr.DURATION) || 60) * (Number(curr.TIME_LOST) || 0);
			}, 0);
			const impactMap = {};
			completedEntries.forEach((curr) => {
				const minutes = Number(curr.TIME_LOST) || 0;
				if (minutes > 0 && curr.TIME_LOST_COMMENT) (Array.isArray(curr.TIME_LOST_COMMENT) ? curr.TIME_LOST_COMMENT : [{
					code: curr.TIME_LOST_COMMENT,
					minutes
				}]).forEach((f) => {
					if (f.code && f.minutes > 0 && !/escalaci[oó]n/i.test(String(f.code))) impactMap[f.code] = (impactMap[f.code] || 0) + Number(f.minutes);
				});
			});
			return {
				efficiency: totalExpected > 0 ? Math.round(totalProduced / totalExpected * 100) : 0,
				produced: totalProduced,
				expected: totalExpected,
				lostMinutes: totalLost,
				lostPieces: Math.round(lostPieces),
				runTime: totalRunTime,
				availability: totalRunTime > 0 ? Math.round((totalRunTime - totalLost) / totalRunTime * 100) : 100,
				top3: Object.entries(impactMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, mins]) => ({
					name,
					mins
				})),
				completedCount: completedEntries.length
			};
		});
		const shiftEntries = derived(() => activeShift === "ALL" ? entries() : entries().filter((e) => e.CALCULATED_SHIFT === activeShift));
		const familyTotals = derived(() => {
			const totals = /* @__PURE__ */ new Map();
			for (const row of shiftEntries()) {
				if (row.IS_GHOST || !(Number(row.PRODUCED) > 0)) continue;
				const name = familyFilterKey(row.FAMILY, row.TYPE, row.SERVER_PROCESS);
				totals.set(name, (totals.get(name) || 0) + (Number(row.PRODUCED) || 0));
			}
			return [...totals.entries()].map(([name, qty]) => ({
				name,
				qty
			})).sort((a, b) => a.name.localeCompare(b.name, "en"));
		});
		const filteredEntries = derived(() => shiftEntries() );
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex min-h-screen bg-zinc-100 font-sans antialiased text-zinc-900"><aside class="w-44 bg-white border-r border-zinc-200 sticky top-0 h-screen flex flex-col shadow-xs"><header class="p-4 border-b border-zinc-100 text-center"><span class="text-[9px] font-black text-orange-600 uppercase tracking-widest block mb-1">Process Units</span> <h2 class="text-sm font-black text-zinc-900 uppercase leading-tight">${escape_html(data.processName || "")}</h2> <div class="mt-2 text-[8px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-200 inline-block uppercase font-bold">${escape_html((data.machines || []).length)} Stations</div></header> <nav class="flex-1 p-2 flex flex-col gap-1 overflow-y-auto"><!--[-->`);
			const each_array = ensure_array_like(data.machines || []);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let machine = each_array[$$index];
				$$renderer.push(`<a${attr("href", `/capture/${stringify((data.processName || "").toLowerCase().replace(/\s+/g, "-"))}/${stringify(machine.toLowerCase())}?date=${stringify(data.selectedDate)}`)}${attr_class(`px-4 py-2 text-[10px] font-black uppercase transition-all border-l-4 ${stringify(activeMachine() === machine.toUpperCase() ? "bg-zinc-50 border-orange-600 text-orange-600" : "border-transparent text-zinc-400 hover:bg-zinc-200")}`)}>${escape_html(machine)}</a>`);
			}
			$$renderer.push(`<!--]--></nav></aside> <main class="flex-1 p-6 overflow-x-hidden"><header class="flex flex-col gap-6 border-b-4 border-zinc-900 pb-6 mb-6">`);
			if (data.isReadOnly) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex flex-col items-center justify-center border-2 border-zinc-900 bg-zinc-900 px-6 py-3 text-center"><span class="text-[9px] font-black tracking-[0.25em] text-[#FF4F00] uppercase">Viewing a closed day</span> <span class="mt-1 font-mono text-lg font-black tracking-tight text-white">${escape_html(data.selectedDate)}</span> <span class="mt-1 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Not the current operating day. Capture is locked.</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="flex items-center justify-between"><div class="flex items-center gap-3 min-w-0"><h1 class="text-4xl font-black uppercase tracking-tighter text-zinc-900">${escape_html(activeMachine() || "Select Station")}</h1> `);
			if (!data.isReadOnly) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button type="button"${attr("disabled", isAndonActive, true)} class="flex cursor-pointer items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-1 text-[9px] font-black tracking-wider text-white uppercase shadow-xs transition-all hover:bg-zinc-800"><span${attr_class(`h-2.5 w-2.5 shrink-0 rounded-full border border-zinc-950 transition-all duration-300 ${stringify("bg-green-500 shadow-[0_0_8px_#22c55e]")}`)}></span> <span${attr_class(clsx$1("text-green-400"))}>${escape_html("OK")}</span></button> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div class="flex items-center gap-2 shrink-0">`);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div> <div class="flex items-end justify-between"><div>`);
			ShiftFilter($$renderer, {
				get active() {
					return activeShift;
				},
				set active($$value) {
					activeShift = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----></div> <div class="mt-2 flex flex-col gap-1"><div class="flex gap-1 items-center h-2"><!--[-->`);
			const each_array_1 = ensure_array_like(shiftSlots());
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let slot = each_array_1[$$index_1];
				$$renderer.push(`<div${attr_class(`w-1.5 h-1.5 rounded-full transition-all duration-300 ${stringify(shiftSlots().filter((_, i) => i < stats().completedCount).includes(slot) ? "bg-green-500" : shiftSlots()[stats().completedCount] === slot ? "bg-amber-500 animate-pulse" : "bg-zinc-200")}`)}></div>`);
			}
			$$renderer.push(`<!--]--></div> <span class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter block mt-1">Calculated on ${escape_html(formatQty(stats().completedCount))} intervals (${escape_html(formatQty(stats().runTime))}m)</span></div> <div class="flex items-center gap-3"><div class="flex flex-wrap justify-end gap-1"><!--[-->`);
			const each_array_2 = ensure_array_like(familyTotals());
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let family = each_array_2[$$index_2];
				$$renderer.push(`<button${attr_class(`cursor-pointer border-2 px-3 py-1 text-[9px] font-black uppercase ${stringify(filterFamily === family.name ? "border-[#FF4F00] bg-orange-50 text-zinc-900" : "border-zinc-200 bg-white text-zinc-400 hover:border-[#FF4F00]")}`)}>${escape_html(family.name)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <button class="cursor-pointer bg-green-700 px-6 py-2 text-[10px] font-black text-white uppercase shadow-xs transition-all hover:bg-green-800 active:scale-95">Export CSV</button></div></div> <div class="grid grid-cols-3 gap-4"><div${attr_class(`bg-white p-4 border-l-4 ${stringify(stats().efficiency < 85 ? "border-red-600" : "border-green-600")} shadow-xs`)}><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Efficiency: ${escape_html(formatQty(stats().efficiency))}%</span> <div class="w-full bg-zinc-100 h-1.5 mb-2"><div${attr_class(`${stringify(stats().efficiency < 85 ? "bg-red-600" : "bg-green-600")} h-1.5`)}${attr_style(`width: ${stringify(stats().efficiency)}%`)}></div></div> <span class="text-sm font-black text-zinc-900">${escape_html(formatQty(stats().produced))} <small class="text-zinc-400">/ ${escape_html(formatQty(stats().expected))} pcs</small></span></div> <div class="bg-white p-4 border-l-4 border-zinc-400 shadow-xs"><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Lost Time: ${escape_html(stats().availability)}% Avail.</span> <div class="flex items-baseline gap-2"><span${attr_class(`text-2xl font-black ${stringify(stats().lostMinutes > 30 ? "text-red-600" : "text-zinc-900")}`)}>${escape_html(formatQty(stats().lostMinutes))}m</span> <span class="text-[10px] font-black text-red-500 uppercase">-${escape_html(formatQty(stats().lostPieces))} pcs</span></div></div> <div class="bg-white p-4 border-l-4 border-orange-600 shadow-xs"><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Top 3 Failure Impact</span> <div class="flex flex-col gap-1">`);
			const each_array_3 = ensure_array_like(stats().top3);
			if (each_array_3.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let fail = each_array_3[$$index_3];
					$$renderer.push(`<div class="flex justify-between text-[10px] font-black border-b border-zinc-50 pb-0.5"><span class="truncate">${escape_html(fail.name)}</span><span class="text-zinc-400">${escape_html(formatQty(fail.mins))}m</span></div>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<span class="text-[10px] font-bold text-zinc-300 italic text-center py-1">No data</span>`);
			}
			$$renderer.push(`<!--]--></div></div></div></header> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <datalist id="codes-list"><!--[-->`);
			const each_array_4 = ensure_array_like(failureCodes());
			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let code = each_array_4[$$index_4];
				$$renderer.option({ value: code.value }, ($$renderer) => {
					$$renderer.push(`${escape_html(code.label)}`);
				});
			}
			$$renderer.push(`<!--]--></datalist>  <datalist id="master-parts-list"><!--[-->`);
			const each_array_5 = ensure_array_like(data.allParts);
			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let item = each_array_5[$$index_5];
				if (data.allRates.some((r) => r.PARTNUMBER === item.PARTNUMBER && r.MACHINE === activeMachine())) {
					$$renderer.push("<!--[0-->");
					$$renderer.option({ value: item.PARTNUMBER }, ($$renderer) => {
						$$renderer.push(`${escape_html(item.FAMILY)}`);
					});
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></datalist> `);
			IntervalTable($$renderer, {
				rows: filteredEntries(),
				isReadOnly: data.isReadOnly,
				liveToken: liveToken()});
			$$renderer.push(`<!----></main> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			Toast($$renderer);
			$$renderer.push(`<!----></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Production Capture Console</footer>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BtL3gqa-.js.map
