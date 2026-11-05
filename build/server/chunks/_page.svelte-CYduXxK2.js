import { a5 as escape_html, a7 as ensure_array_like, a2 as attr, a4 as stringify, a3 as attr_class, a9 as clsx$1, a6 as attr_style, X as derived, a8 as bind_props } from './dev-CSPWYH9f.js';
import { b as buildTimeline } from './plantTime-CjpO2xUR.js';
import { a as formatQty, g as getRefinedDate, d as displayHourToken, f as failureCauseSuffix, l as liveHourToken, b as formatToDBSlashDate, i as isIntervalInFuture, e as extractHourMinute } from './captureFormat-5spFGeAz.js';
import './plantAreas-DImca8Fn.js';
import { p as page } from './state-nCAFLkfF.js';
import { c as captureHref } from './capturePath-R_tTjP2G.js';
import { i as isFailureTransit, e as expectedLevel, n as normalizeLevel } from './pieceLevel-B94ZE9fG.js';
import { n as netExpected, u as unplannedMinutes, p as programmedMinutes, a as unplannedPieces, i as isProgrammedCode, l as lossKind } from './downtime-Cgg3eN_G.js';
import { a as familyMatchesFilter, f as familyFilterKey } from './familyGroups-BQ0VX3ms.js';
import './client-DZ8k5AXj.js';
import './internal-KhZZ_anA.js';
import './index-DBqjc0Yf.js';

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
		let { rows, isReadOnly, liveToken, partsFromHistory = false} = $$props;
		let openHours = {};
		function needsFailure(row) {
			if (!row || row.IS_LEVEL_REVIEW || !(Number(row.TIME_LOST) > 0)) return false;
			if (!isReadOnly && displayHourToken(row.DISPLAY_ID) === liveToken) return false;
			const comment = row.TIME_LOST_COMMENT;
			if (Array.isArray(comment)) return !comment.some((entry) => entry.code && Number(entry.minutes) > 0);
			return !comment;
		}
		function hiddenNeedFailure(index) {
			const id = rows[index]?.DISPLAY_ID;
			if (!id || openHours[id]) return null;
			for (let i = index + 1; i < rows.length && rows[i].DISPLAY_ID === id; i++) if (needsFailure(rows[i])) return rows[i];
			return null;
		}
		function blockExtras(index) {
			const id = rows[index]?.DISPLAY_ID;
			let count = 0;
			for (let i = index + 1; i < rows.length && rows[i].DISPLAY_ID === id; i++) if (!rows[i].IS_LEVEL_REVIEW) count += 1;
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
			const surfaced = isFirstOfHour && !needsFailure(row) ? hiddenNeedFailure(index) : null;
			if (isFirstOfHour || openHours[row.DISPLAY_ID] || row.IS_LEVEL_REVIEW) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<tr${attr_class(`border-l-4 transition-colors ${stringify(row.IS_LEVEL_REVIEW ? "border-violet-600 bg-violet-50 hover:bg-violet-100" : `hover:bg-zinc-50/80 ${isFirstOfHour ? "border-transparent hover:border-orange-600" : "border-dashed border-zinc-300 bg-zinc-50/30 hover:border-zinc-400"} ${row.IS_GHOST ? "italic opacity-60" : ""}`)}`)}${attr("title", row.IS_LEVEL_REVIEW ? `Level review. This part is still a ${row.REVIEW_LEVEL}; this process expects a ${row.REVIEW_EXPECTED}. Excluded from the total, efficiency, and run time.` : void 0)}><td${attr_class(`relative overflow-hidden border-r p-2 whitespace-nowrap ${stringify(row.IS_LEVEL_REVIEW ? "border-violet-100 bg-violet-100/80" : "border-zinc-100 bg-zinc-50/50")}`)}>`);
				if (isFirstOfHour) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="flex items-center gap-2"><div class="flex flex-col leading-tight"><span class="text-[9px] font-black tracking-tighter text-orange-600 italic">${escape_html(d.day)}</span> <span class="text-[9px] font-black tracking-tighter text-zinc-400">${escape_html(d.month)} ${escape_html(d.num)}</span></div> <div class="h-4 w-px bg-zinc-200"></div> <div class="flex items-baseline gap-0.5"><span class="text-[14px] leading-none font-black tracking-tighter text-zinc-900 italic tabular-nums">${escape_html(d.time)}</span> <span class="text-[9px] font-black tracking-tighter text-zinc-400">${escape_html(d.period)}</span></div> `);
					if (row.IS_LEVEL_REVIEW) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="rounded-xs border border-violet-300 bg-violet-200 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-violet-800 uppercase">Level review</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (extras > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button type="button" class="cursor-pointer text-[9px] font-black text-orange-600">${escape_html(openHours[row.DISPLAY_ID] ? "▼" : "▶")} ${escape_html(extras)}</button>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				} else if (row.IS_LEVEL_REVIEW) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<div class="flex h-full items-center gap-2 pl-6"><div class="absolute top-0 bottom-0 left-4 w-0.5 border-l border-dashed border-violet-300"></div> <div class="flex items-baseline gap-0.5"><span class="text-[12px] leading-none font-black tracking-tighter text-violet-900 italic tabular-nums">${escape_html(d.time)}</span> <span class="text-[8px] font-black tracking-tighter text-violet-500">${escape_html(d.period)}</span></div> <span class="rounded-xs border border-violet-300 bg-violet-200 px-1.5 py-0.5 font-sans text-[8px] font-black tracking-wider text-violet-800 uppercase">Level review</span></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="flex h-full items-center gap-2 pl-6"><div class="absolute top-0 bottom-0 left-4 w-0.5 border-l border-dashed border-zinc-300"></div> <span class="animate-pulse rounded-xs border border-orange-200 bg-orange-100 px-1.5 py-0.5 font-sans text-[8px] font-black tracking-wider text-orange-700 uppercase">↳ CHANGEOVER DETECTED</span></div>`);
				}
				$$renderer.push(`<!--]--></td><td class="relative border-r border-zinc-100 p-2 text-center">`);
				if (row.REQUIRES_PART && !isReadOnly) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="flex flex-col items-center gap-1"><input type="text" list="master-parts-list" placeholder="SEARCH PART..." class="w-full border-2 border-orange-400 bg-orange-50 p-1 text-center text-[10px] font-black uppercase outline-none transition-colors placeholder:text-orange-300 focus:bg-white"${attr("name", `part-input-${row.IDENTIFIER}`)}/> <span class="animate-pulse text-[7px] font-bold text-orange-500">${escape_html(partsFromHistory ? "MODELS RUN ON THIS MACHINE" : "REQUIRED")}</span></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="flex flex-col"><span${attr_class(`font-mono text-xs font-bold ${stringify(row.IS_LEVEL_REVIEW ? "text-violet-900" : "text-zinc-900")}`)}>${escape_html(row.PARTNUMBER)}</span> `);
					if (row.IS_LEVEL_REVIEW) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-[8px] font-black tracking-tight text-violet-700 uppercase">${escape_html(row.REVIEW_LEVEL)} · expected ${escape_html(row.REVIEW_EXPECTED)}</span>`);
					} else if (row.IS_GHOST) {
						$$renderer.push("<!--[1-->");
						$$renderer.push(`<span class="text-[8px] font-bold tracking-tighter text-blue-500 uppercase">INHERITED</span>`);
					} else if (row.SERVER_SOURCE === "MANUAL_ENTRY") {
						$$renderer.push("<!--[2-->");
						$$renderer.push(`<span class="text-[8px] font-bold tracking-tighter text-orange-500 uppercase">MANUAL ENTRY</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				}
				$$renderer.push(`<!--]--></td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-zinc-900 uppercase"${attr("title", `${row.FAMILY || "-"} ${row?.SERVER_PROCESS?.toString()?.includes("SPI_S2") ? "(2)" : ""}`.trim())}>${escape_html(`${row.FAMILY || "-"} ${row?.SERVER_PROCESS?.toString()?.includes("SPI_S2") ? "(2)" : ""}`)}</td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-zinc-400">${escape_html(formatQty(row.RATE))}</td><td${attr_class(`border-r border-zinc-100 p-2 text-center font-mono text-xs ${stringify(row.IS_LEVEL_REVIEW ? "font-black text-violet-700" : "font-bold text-blue-600")}`)}>${escape_html(formatQty(row.PRODUCED))} `);
				if (row.IS_LEVEL_REVIEW) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="block text-[8px] font-black tracking-tight text-violet-500 uppercase">Excluded</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-red-600"${attr("title", !row.IS_LEVEL_REVIEW && Number(row.FAIL_QTY) > 0 ? `${formatQty(row.FAIL_QTY)} confirmed failure pieces included in this interval` : void 0)}>${escape_html(row.IS_LEVEL_REVIEW ? "—" : formatQty((Number(row.QUALITY?.fail) || 0) + (Number(row.FAIL_QTY) || 0)))}</td><td class="border-r border-zinc-100 p-2 text-center font-mono text-xs text-zinc-400 italic"><span${attr_class(clsx$1(row.IS_LEVEL_REVIEW ? "font-black text-violet-700" : !isFirstOfHour ? "font-bold text-orange-600" : ""))}>${escape_html(formatQty(row.DURATION))}m</span></td><td${attr_class(`border-r border-zinc-100 p-2 text-center font-mono text-xs font-black ${stringify(lossKind(row) === "programmed" ? "bg-sky-50 text-sky-700" : lossKind(row) === "mixed" ? "bg-amber-50 text-amber-700" : row.TIME_LOST > 0 ? "bg-red-50 text-red-600" : "text-zinc-200")}`)}${attr("title", lossKind(row) === "programmed" ? "Programmed downtime. Out of efficiency and availability." : lossKind(row) === "mixed" ? "Split between a failure and programmed downtime." : void 0)}>${escape_html(formatQty(row.TIME_LOST))}m</td><td class="border-r border-zinc-100 p-1"><button${attr("disabled", row.TIME_LOST <= 0 || isLiveInterval || row.IS_LEVEL_REVIEW, true)}${attr("title", surfaced ? "A hidden interval in this hour still needs a failure code. Open the group to capture it." : void 0)}${attr_class(`flex h-10 w-full items-center justify-between rounded-xs px-3 text-[10px] font-black uppercase transition-all ${stringify(row.IS_LEVEL_REVIEW ? "cursor-not-allowed border-l-4 border-violet-400 bg-violet-100 text-violet-700 select-none" : isLiveInterval ? "cursor-not-allowed border-l-4 border-zinc-300 bg-zinc-100 text-zinc-400 select-none" : lossKind(row) === "programmed" ? "cursor-pointer border-l-4 border-sky-600 bg-sky-50 text-sky-800 hover:bg-sky-100" : lossKind(row) === "mixed" ? "cursor-pointer border-l-4 border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100" : row.TIME_LOST > 0 ? "cursor-pointer border-l-4 border-red-600 bg-red-50 text-red-700 hover:bg-red-100/70" : surfaced ? "cursor-not-allowed border-l-4 border-orange-500 bg-orange-50 text-orange-700 select-none disabled:opacity-100" : "cursor-pointer bg-zinc-50 text-zinc-400")}`)}><span class="truncate pr-2 text-left">`);
				if (row.IS_LEVEL_REVIEW) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`LEVEL REVIEW`);
				} else if (isLiveInterval) {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`🔒 WAITING FOR INTERVAL END...`);
				} else if (surfaced) {
					$$renderer.push("<!--[2-->");
					$$renderer.push(`⚠️ GROUP NEEDS FAILURE`);
				} else if (Array.isArray(row.TIME_LOST_COMMENT)) {
					$$renderer.push("<!--[3-->");
					$$renderer.push(`${escape_html(row.TIME_LOST_COMMENT.filter((f) => f.code && f.minutes > 0).map((f) => `${formatQty(f.minutes)}' ${f.code}${failureCauseSuffix(f)}`).join(", ") || (row.TIME_LOST > 0 ? "⚠️ NEED FAILURE" : "---"))}`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`${escape_html(row.TIME_LOST > 0 ? row.TIME_LOST_COMMENT || "⚠️ NEED FAILURE" : "---")}`);
				}
				$$renderer.push(`<!--]--></span></button></td><td class="p-1"><input${attr("id", `comment-input-${stringify(row.IDENTIFIER)}`)} type="text"${attr("value", isLiveInterval ? "" : row.COMMENTS)}${attr("disabled", isReadOnly || row.IS_LOCKED || isLiveInterval || row.IS_LEVEL_REVIEW, true)}${attr_class(`w-full rounded-xs border-0 bg-transparent p-2 text-[10px] font-bold uppercase outline-hidden transition-colors ${stringify(row.IS_LEVEL_REVIEW ? "cursor-not-allowed bg-violet-100/60 text-violet-700 italic" : isReadOnly || row.IS_LOCKED || isLiveInterval ? "cursor-not-allowed bg-zinc-50 italic opacity-40" : "focus:bg-zinc-50")}`)}${attr("placeholder", row.IS_LEVEL_REVIEW ? "LEVEL REVIEW" : isLiveInterval ? "🔒 WAITING FOR INTERVAL END..." : row.IS_LOCKED ? "INTERVAL LOCKED..." : "ADD NOTE...")}${attr("name", `comment-input-${row.IDENTIFIER}`)}/></td></tr>`);
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
		const activeMachine = derived(() => data.machineName || "");
		const stationNames = derived(() => [...new Set(data.machines || [])]);
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
			const loggedIds = new Set(reactiveLogs().map((row) => row.IDENTIFIER));
			const transitLogs = (data.transitFailures || []).filter((row) => row?.IDENTIFIER && !loggedIds.has(row.IDENTIFIER));
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
				const acceptedLevels = new Set(page.data.acceptedLevels || []);
				const goods = matches.filter((row) => !isFailureTransit(row, acceptedLevels));
				const reviews = matches.filter((row) => isFailureTransit(row, acceptedLevels));
				const slotFailures = transitLogs.filter((row) => extractHourMinute(row.DISPLAY_ID) === slot.time);
				const slotStart = reconstructed.length;
				if (goods.length > 0) {
					if (goods.length > 1) goods.sort((a, b) => a.PARTNUMBER === lastValidRunningJob.PARTNUMBER ? -1 : b.PARTNUMBER === lastValidRunningJob.PARTNUMBER ? 1 : 0);
					let remainingMinutes = slot.duration;
					goods.forEach((row, idx) => {
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
						const finalDuration = row.DURATION !== void 0 && row.DURATION !== null ? Number(row.DURATION) : idx === goods.length - 1 ? Math.max(0, remainingMinutes) : Math.min(Math.floor(Number(row.PRODUCED) * 60 / (Number(row.RATE) || lastValidRunningJob.BASE_RATE || 1)) || 0, remainingMinutes);
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
							IS_LOCKED: false,
							IS_LEVEL_REVIEW: false
						});
					});
				} else if (reviews.length === 0 || slotFailures.length > 0) {
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
						IS_LOCKED: false,
						IS_LEVEL_REVIEW: false
					});
				}
				const host = reconstructed[slotStart];
				if (slotFailures.length && host && !host.IS_LEVEL_REVIEW) {
					const failQty = slotFailures.reduce((sum, row) => sum + (Number(row.PRODUCED) || 0), 0);
					host.FAIL_QTY = failQty;
					if (!goods.length) {
						host.PRODUCED = 0;
						const duration = Number(host.DURATION) || slot.duration;
						const rate = Number(host.RATE) || 0;
						const hourly = duration > 0 ? rate / duration * 60 : 0;
						host.DURATION = duration;
						if (hourly > 0) host.TIME_LOST = failQty < rate ? Math.max(0, Math.round(duration - failQty * 60 / hourly)) : 0;
					} else {
						const used = reconstructed.slice(slotStart).reduce((sum, row) => sum + (Number(row.DURATION) || 0), 0);
						const missing = Math.max(0, slot.duration - used);
						const baseDuration = Number(host.DURATION) || 0;
						const baseRate = Number(host.RATE) || 0;
						const hourly = baseDuration > 0 ? baseRate / baseDuration * 60 : 0;
						if (missing > 0 && hourly > 0) {
							host.DURATION = baseDuration + missing;
							host.RATE = Math.round(hourly / 60 * host.DURATION);
						}
						const duration = Number(host.DURATION) || 0;
						const rate = Number(host.RATE) || 0;
						const hour = duration > 0 ? rate / duration * 60 : hourly;
						if (hour > 0) {
							const output = (Number(host.PRODUCED) || 0) + failQty;
							host.TIME_LOST = output < rate ? Math.max(0, Math.round(duration - output * 60 / hour)) : 0;
						}
					}
				}
				for (const row of reviews) reconstructed.push({
					...row,
					RATE: Number(row.RATE) || 0,
					CALCULATED_SHIFT: slot.shift,
					DURATION: row.DURATION != null ? Number(row.DURATION) : 0,
					TIME_LOST: Number(row.TIME_LOST) || 0,
					PRODUCED: Number(row.PRODUCED) || 0,
					SERVER_SOURCE: row.SERVER_SOURCE || "MANUAL_ENTRY",
					SERVER_PROCESS: row.SERVER_PROCESS || (row.PROCESS || data.processName).toUpperCase(),
					IS_GHOST: false,
					IS_LOCKED: true,
					IS_LEVEL_REVIEW: true,
					REVIEW_LEVEL: normalizeLevel(row.LEVEL).toLowerCase(),
					REVIEW_EXPECTED: expectedLevel(row.TYPE, row.PROCESS).toLowerCase()
				});
			});
			return reconstructed;
		});
		const timelineTemplate = derived(() => buildTimeline(!!data.isSpecialDay));
		const shiftSlots = derived(() => activeShift === "ALL" ? timelineTemplate() : timelineTemplate().filter((slot) => slot.shift === activeShift));
		const liveToken = derived(() => {
			data.selectedDate;
			return liveHourToken(/* @__PURE__ */ new Date(), !!data.isSpecialDay);
		});
		const stats = derived(() => {
			const counted = entries().filter((e) => {
				const matchesShift = activeShift === "ALL" || e.CALCULATED_SHIFT === activeShift;
				const matchesFamily = familyMatchesFilter(e.FAMILY, filterFamily, e.TYPE, e.SERVER_PROCESS);
				return matchesShift && matchesFamily && !e.IS_LOCKED;
			}).filter((row) => !row.IS_LEVEL_REVIEW);
			const totalProduced = counted.reduce((acc, curr) => acc + (Number(curr.PRODUCED) || 0), 0);
			const totalFail = counted.reduce((acc, curr) => acc + (Number(curr.FAIL_QTY) || 0), 0);
			const grossExpected = counted.reduce((acc, curr) => acc + (Number(curr.RATE) || 0), 0);
			const totalExpected = counted.reduce((acc, curr) => acc + netExpected(curr), 0);
			const unplanned = counted.reduce((acc, curr) => acc + unplannedMinutes(curr), 0);
			const programmed = counted.reduce((acc, curr) => acc + programmedMinutes(curr), 0);
			const totalRunTime = counted.reduce((acc, curr) => acc + (Number(curr.DURATION) || 0), 0);
			const lostPieces = counted.reduce((acc, curr) => acc + unplannedPieces(curr), 0);
			const availableTime = Math.max(0, totalRunTime - programmed);
			const operatingTime = Math.max(0, availableTime - unplanned);
			const impactMap = {};
			counted.forEach((curr) => {
				const minutes = Number(curr.TIME_LOST) || 0;
				if (minutes > 0 && curr.TIME_LOST_COMMENT) (Array.isArray(curr.TIME_LOST_COMMENT) ? curr.TIME_LOST_COMMENT : [{
					code: curr.TIME_LOST_COMMENT,
					minutes
				}]).forEach((f) => {
					if (f.code && f.minutes > 0 && !isProgrammedCode(f.code) && !/escalaci[oó]n/i.test(String(f.code))) impactMap[f.code] = (impactMap[f.code] || 0) + Number(f.minutes);
				});
			});
			return {
				efficiency: totalExpected > 0 ? Math.round((totalProduced + totalFail) / totalExpected * 100) : 0,
				produced: totalProduced,
				expected: totalExpected,
				grossExpected,
				lostMinutes: unplanned,
				programmedMinutes: programmed,
				lostPieces: Math.round(lostPieces),
				runTime: totalRunTime,
				availability: availableTime > 0 ? Math.round(operatingTime / availableTime * 100) : 100,
				top3: Object.entries(impactMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, mins]) => ({
					name,
					mins
				})),
				completedCount: counted.length
			};
		});
		const shiftEntries = derived(() => activeShift === "ALL" ? entries() : entries().filter((e) => e.CALCULATED_SHIFT === activeShift));
		const familyTotals = derived(() => {
			const totals = /* @__PURE__ */ new Map();
			for (const row of shiftEntries()) {
				if (row.IS_GHOST || row.IS_LEVEL_REVIEW || !(Number(row.PRODUCED) > 0)) continue;
				const name = familyFilterKey(row.FAMILY, row.TYPE, row.SERVER_PROCESS);
				totals.set(name, (totals.get(name) || 0) + (Number(row.PRODUCED) || 0));
			}
			return [...totals.entries()].map(([name, qty]) => ({
				name,
				qty
			})).sort((a, b) => a.name.localeCompare(b.name, "en"));
		});
		const filteredEntries = derived(() => shiftEntries() );
		const reviewCount = derived(() => filteredEntries().filter((row) => row.IS_LEVEL_REVIEW).length);
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex min-h-screen bg-zinc-100 font-sans antialiased text-zinc-900"><aside class="w-44 bg-white border-r border-zinc-200 sticky top-0 h-screen flex flex-col shadow-xs"><header class="p-4 border-b border-zinc-100 text-center"><span class="text-[9px] font-black text-orange-600 uppercase tracking-widest block mb-1">Process Units</span> <h2 class="text-sm font-black text-zinc-900 uppercase leading-tight">${escape_html(data.processName || "")}</h2> <div class="mt-2 text-[8px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-200 inline-block uppercase font-bold">${escape_html(stationNames().length)} Stations</div></header> <nav class="flex-1 p-2 flex flex-col gap-1 overflow-y-auto"><!--[-->`);
			const each_array = ensure_array_like(stationNames());
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let machine = each_array[$$index];
				$$renderer.push(`<a${attr("href", `${stringify(captureHref(data.processName, machine, data.selectedDate))}${stringify(data.area === "FINISH" ? "&area=finish" : "")}`)}${attr_class(`px-4 py-2 text-[10px] font-black uppercase transition-all border-l-4 ${stringify(activeMachine() === machine.toUpperCase() ? "bg-zinc-50 border-orange-600 text-orange-600" : "border-transparent text-zinc-400 hover:bg-zinc-200")}`)}>${escape_html(machine)}</a>`);
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
			$$renderer.push(`<!--]--></div> <button class="cursor-pointer bg-green-700 px-6 py-2 text-[10px] font-black text-white uppercase shadow-xs transition-all hover:bg-green-800 active:scale-95">Export CSV</button></div></div> <div class="grid grid-cols-1 gap-4 md:grid-cols-3"><div${attr_class(`bg-white p-4 border-l-4 ${stringify(stats().efficiency < 85 ? "border-red-600" : "border-green-600")} shadow-xs`)}><div class="flex items-baseline justify-between gap-2"><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Efficiency</span> <span class="text-[9px] font-black text-zinc-400 uppercase">of available</span></div> <span${attr_class(`mt-1 block text-2xl font-black tabular-nums ${stringify(stats().efficiency < 85 ? "text-red-600" : "text-zinc-900")}`)}>${escape_html(formatQty(stats().efficiency))}%</span> <div class="my-2 h-1.5 w-full bg-zinc-100"><div${attr_class(`${stringify(stats().efficiency < 85 ? "bg-red-600" : "bg-green-600")} h-1.5`)}${attr_style(`width: ${stringify(Math.min(stats().efficiency, 100))}%`)}></div></div> <span class="text-sm font-black text-zinc-900">${escape_html(formatQty(stats().produced))} <small class="text-zinc-400">/ ${escape_html(formatQty(stats().expected))} pcs</small></span> `);
			if (stats().programmedMinutes > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="mt-1 block text-[9px] font-bold text-sky-700 uppercase">Gross ${escape_html(formatQty(stats().grossExpected))} pcs · programmed time removed</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <div${attr_class(`bg-white p-4 border-l-4 ${stringify(stats().lostMinutes > 0 ? "border-red-600" : "border-zinc-300")} shadow-xs`)}><div class="flex items-baseline justify-between gap-2"><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Unplanned loss</span> <span class="text-[9px] font-black text-zinc-400 uppercase">${escape_html(stats().availability)}% avail.</span></div> <div class="mt-1 flex items-baseline gap-2"><span${attr_class(`text-2xl font-black tabular-nums ${stringify(stats().lostMinutes > 0 ? "text-red-600" : "text-zinc-900")}`)}>${escape_html(formatQty(stats().lostMinutes))}m</span> <span class="text-[10px] font-black text-red-500 uppercase">-${escape_html(formatQty(stats().lostPieces))} pcs</span></div> <div class="my-2 h-1.5 w-full bg-zinc-100"><div class="h-1.5 bg-red-600"${attr_style(`width: ${stringify(Math.min(100 - stats().availability, 100))}%`)}></div></div> <div class="flex items-baseline justify-between border-t border-zinc-100 pt-2"><span class="text-[9px] font-black tracking-widest text-sky-700 uppercase">Programmed</span> <span class="text-sm font-black tabular-nums text-sky-700">${escape_html(formatQty(stats().programmedMinutes))}m</span></div> <span class="mt-0.5 block text-[8px] font-bold tracking-wide text-zinc-400 uppercase">Out of efficiency and availability</span></div> <div class="bg-white p-4 border-l-4 border-orange-600 shadow-xs"><span class="mb-2 block text-[9px] font-black tracking-widest text-zinc-400 uppercase">Unplanned impact</span> <div class="flex flex-col gap-1">`);
			const each_array_3 = ensure_array_like(stats().top3);
			if (each_array_3.length !== 0) {
				$$renderer.push("<!--[-->");
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let fail = each_array_3[$$index_3];
					$$renderer.push(`<div class="flex justify-between gap-2 border-b border-zinc-50 pb-0.5 text-[10px] font-black"><span class="truncate">${escape_html(fail.name)}</span><span class="shrink-0 text-zinc-400">${escape_html(formatQty(fail.mins))}m</span></div>`);
				}
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push(`<span class="py-1 text-center text-[10px] font-bold text-zinc-300 italic">No unplanned loss</span>`);
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
				$$renderer.option({ value: item.PARTNUMBER }, ($$renderer) => {
					$$renderer.push(`${escape_html(item.FAMILY)}`);
				});
			}
			$$renderer.push(`<!--]--></datalist> `);
			if (reviewCount() > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="border border-violet-300 bg-violet-50 px-3 py-2 text-[10px] font-black tracking-wide text-violet-800 uppercase">${escape_html(formatQty(reviewCount()))} level review ${escape_html(reviewCount() === 1 ? "row" : "rows")} highlighted in violet. Excluded from the total, efficiency, and run time until you confirm which ones are real failures.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			IntervalTable($$renderer, {
				rows: filteredEntries(),
				isReadOnly: data.isReadOnly,
				liveToken: liveToken(),
				partsFromHistory: !!data.partsFromHistory});
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
//# sourceMappingURL=_page.svelte-CYduXxK2.js.map
