import { U as escape_html, a6 as ensure_array_like, S as attr, V as stringify, T as attr_class, a9 as clsx$1, a7 as attr_style, K as derived } from './dev-BeB9xBTu.js';
import { p as page } from './state-DRiBbYts.js';
import './client-BvSdefav.js';
import './index-server-D1jVuM2R.js';
import './internal-BsbvprU4.js';
import './index-DBqjc0Yf.js';

//#region src/routes/capture/[process]/[machine]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function getRefinedDate(id) {
			if (!id) return {
				day: "",
				month: "",
				num: "",
				time: "--:--",
				period: ""
			};
			const dateMatch = id.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
			id.match(/(\d{1,2}:\d{2})(?::\d{2})?\s*(AM|PM)/i);
			id.match(/(\d{1,2 drift}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
			const realTimeMatch = id.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
			if (!dateMatch || !realTimeMatch) return {
				day: "",
				month: "",
				num: "",
				time: id,
				period: ""
			};
			const [, m, d, y] = dateMatch;
			const dateObj = new Date(y, m - 1, d);
			return {
				day: dateObj.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
				month: dateObj.toLocaleString("en-US", { month: "long" }).toUpperCase(),
				num: d,
				time: `${realTimeMatch[1]}:${realTimeMatch[2]}`,
				period: realTimeMatch[3].toUpperCase()
			};
		}
		function formatToDBSlashDate(isoDateString) {
			if (!isoDateString) return "";
			const [year, month, day] = isoDateString.split("-");
			return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
		}
		function extractHourMinute(displayId) {
			if (!displayId) return "";
			const fb = displayId.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
			if (!fb) return "";
			return `${parseInt(fb[1], 10).toString().padStart(2, "0")}:${fb[2]} ${fb[3].toUpperCase()}`;
		}
		function isIntervalInFuture(slotDateStr, slotTimeStr) {
			const now = /* @__PURE__ */ new Date();
			const [m, d, y] = slotDateStr.split("/").map(Number);
			const match = slotTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
			if (!match) return false;
			let hours = parseInt(match[1], 10);
			const minutes = parseInt(match[2], 10);
			const ampm = match[3].toUpperCase();
			if (ampm === "PM" && hours < 12) hours += 12;
			if (ampm === "AM" && hours === 12) hours = 0;
			const intervalDate = new Date(y, m - 1, d, hours, minutes, 0);
			if (hours < 6 || hours === 6 && minutes < 40) intervalDate.setDate(intervalDate.getDate() + 1);
			return intervalDate > now;
		}
		let { data } = $$props;
		const activeMachine = derived(() => (page.params.machine || "").toUpperCase());
		const failureCodes = derived(() => data.failureCodes || []);
		let activeShift = "ALL";
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
		let timelineTemplate = derived(() => {
			if (!data.isSpecialDay) return [
				{
					time: "06:40 AM",
					shift: "T09",
					duration: 20
				},
				{
					time: "07:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "08:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "09:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "10:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "11:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "12:00 PM",
					shift: "T09",
					duration: 60
				},
				{
					time: "01:00 PM",
					shift: "T09",
					duration: 60
				},
				{
					time: "02:00 PM",
					shift: "T09",
					duration: 60
				},
				{
					time: "03:00 PM",
					shift: "T09",
					duration: 60
				},
				{
					time: "04:00 PM",
					shift: "T09",
					duration: 10
				},
				{
					time: "04:10 PM",
					shift: "T25",
					duration: 50
				},
				{
					time: "05:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "06:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "07:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "08:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "09:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "10:00 PM",
					shift: "T25",
					duration: 16
				},
				{
					time: "10:16 PM",
					shift: "T08",
					duration: 44
				},
				{
					time: "11:00 PM",
					shift: "T08",
					duration: 60
				},
				{
					time: "12:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "01:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "02:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "03:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "04:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "05:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "06:00 AM",
					shift: "T08",
					duration: 40
				}
			];
			else return [
				{
					time: "06:40 AM",
					shift: "T09",
					duration: 20
				},
				{
					time: "07:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "08:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "09:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "10:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "11:00 AM",
					shift: "T09",
					duration: 60
				},
				{
					time: "12:00 PM",
					shift: "T09",
					duration: 60
				},
				{
					time: "01:00 PM",
					shift: "T09",
					duration: 60
				},
				{
					time: "02:00 PM",
					shift: "T09",
					duration: 40
				},
				{
					time: "02:40 PM",
					shift: "T25",
					duration: 20
				},
				{
					time: "03:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "04:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "05:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "06:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "07:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "08:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "09:00 PM",
					shift: "T25",
					duration: 60
				},
				{
					time: "10:00 PM",
					shift: "T25",
					duration: 40
				},
				{
					time: "10:40 PM",
					shift: "T08",
					duration: 20
				},
				{
					time: "11:00 PM",
					shift: "T08",
					duration: 60
				},
				{
					time: "12:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "01:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "02:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "03:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "04:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "05:00 AM",
					shift: "T08",
					duration: 60
				},
				{
					time: "06:00 AM",
					shift: "T08",
					duration: 40
				}
			];
		});
		const stats = derived(() => {
			const completedEntries = entries().filter((e) => {
				return !e.IS_LOCKED;
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
					if (f.code && f.minutes > 0) impactMap[f.code] = (impactMap[f.code] || 0) + Number(f.minutes);
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
		const filteredEntries = derived(() => entries() );
		$$renderer.push(`<div class="flex min-h-screen bg-zinc-100 font-sans antialiased text-zinc-900"><aside class="w-44 bg-white border-r border-zinc-200 sticky top-0 h-screen flex flex-col shadow-xs"><header class="p-4 border-b border-zinc-100 text-center"><span class="text-[9px] font-black text-orange-600 uppercase tracking-widest block mb-1">Process Units</span> <h2 class="text-sm font-black text-zinc-900 uppercase leading-tight">${escape_html(data.processName || "")}</h2> <div class="mt-2 text-[8px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-200 inline-block uppercase font-bold">${escape_html((data.machines || []).length)} Stations</div></header> <nav class="flex-1 p-2 flex flex-col gap-1 overflow-y-auto"><!--[-->`);
		const each_array = ensure_array_like(data.machines || []);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let machine = each_array[$$index];
			$$renderer.push(`<a${attr("href", `/capture/${stringify((data.processName || "").toLowerCase().replace(/\s+/g, "-"))}/${stringify(machine.toLowerCase())}?date=${stringify(data.selectedDate)}`)}${attr_class(`px-4 py-2 text-[10px] font-black uppercase transition-all border-l-4 ${stringify(activeMachine() === machine.toUpperCase() ? "bg-zinc-50 border-orange-600 text-orange-600" : "border-transparent text-zinc-400 hover:bg-zinc-200")}`)}>${escape_html(machine)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></aside> <main class="flex-1 p-6 overflow-x-hidden"><header class="flex flex-col gap-6 border-b-4 border-zinc-900 pb-6 mb-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3 min-w-0"><h1 class="text-4xl font-black uppercase tracking-tighter text-zinc-900">${escape_html(activeMachine() || "Select Station")}</h1> <button type="button"${attr("disabled", data.isReadOnly, true)}${attr_class(`flex items-center mt-1 gap-1.5 px-2 py-1 rounded-sm bg-zinc-900 border border-zinc-800 shadow-xs text-[9px] font-black tracking-wider uppercase text-white transition-all disabled:cursor-not-allowed ${stringify(!data.isReadOnly ? "cursor-pointer hover:bg-zinc-800" : "")}`)}><span${attr_class(`w-2.5 h-2.5 rounded-full border border-zinc-950 transition-all duration-300 shrink-0 ${stringify("bg-green-500 shadow-[0_0_8px_#22c55e]")}`)}></span> <span${attr_class(clsx$1("text-green-400"))}>${escape_html("OK")}</span></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex items-center gap-2 shrink-0">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> <div class="flex items-end justify-between"><div><div class="flex gap-2 mt-4"><!--[-->`);
		const each_array_1 = ensure_array_like([
			"ALL",
			"T09",
			"T25",
			"T08"
		]);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let shift = each_array_1[$$index_1];
			$$renderer.push(`<button${attr_class(`px-4 py-1 text-[10px] font-black border-2 transition-all cursor-pointer ${stringify(activeShift === shift ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-400 hover:border-orange-600")}`)}>${escape_html(shift)}</button>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="mt-2 flex flex-col gap-1"><div class="flex gap-1 items-center h-2"><!--[-->`);
		const each_array_2 = ensure_array_like(Array(timelineTemplate().length));
		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			each_array_2[i];
			$$renderer.push(`<div${attr_class(`w-1.5 h-1.5 rounded-full transition-all duration-300 ${stringify(i < stats().completedCount ? "bg-green-500" : i === stats().completedCount ? "bg-amber-500 animate-pulse" : "bg-zinc-200")}`)}></div>`);
		}
		$$renderer.push(`<!--]--></div> <span class="text-[8px] font-black text-zinc-400 uppercase tracking-tighter block mt-1">Calculated on ${escape_html(stats().completedCount)} intervals (${escape_html(stats().runTime)}m)</span></div> <div class="flex items-center gap-3">`);
		if (data.isReadOnly) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-zinc-100 border border-zinc-300 px-4 py-2 flex items-center gap-2"><span class="text-[10px] font-black text-zinc-500 uppercase">🔒 Read Only Mode</span></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button class="bg-green-700 hover:bg-green-800 text-white px-6 py-2 text-[10px] font-black uppercase shadow-xs transition-all active:scale-95 cursor-pointer">Export Excel</button></div></div> <div class="grid grid-cols-3 gap-4"><div${attr_class(`bg-white p-4 border-l-4 ${stringify(stats().efficiency < 85 ? "border-red-600" : "border-green-600")} shadow-xs`)}><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Efficiency: ${escape_html(stats().efficiency)}%</span> <div class="w-full bg-zinc-100 h-1.5 mb-2"><div${attr_class(`${stringify(stats().efficiency < 85 ? "bg-red-600" : "bg-green-600")} h-1.5`)}${attr_style(`width: ${stringify(stats().efficiency)}%`)}></div></div> <span class="text-sm font-black text-zinc-900">${escape_html(stats().produced)} <small class="text-zinc-400">/ ${escape_html(stats().expected)} pcs</small></span></div> <div class="bg-white p-4 border-l-4 border-zinc-400 shadow-xs"><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Lost Time: ${escape_html(stats().availability)}% Avail.</span> <div class="flex items-baseline gap-2"><span${attr_class(`text-2xl font-black ${stringify(stats().lostMinutes > 30 ? "text-red-600" : "text-zinc-900")}`)}>${escape_html(stats().lostMinutes)}m</span> <span class="text-[10px] font-black text-red-500 uppercase">-${escape_html(stats().lostPieces)} pcs</span></div></div> <div class="bg-white p-4 border-l-4 border-orange-600 shadow-xs"><span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Top 3 Failure Impact</span> <div class="flex flex-col gap-1">`);
		const each_array_3 = ensure_array_like(stats().top3);
		if (each_array_3.length !== 0) {
			$$renderer.push("<!--[-->");
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let fail = each_array_3[$$index_3];
				$$renderer.push(`<div class="flex justify-between text-[10px] font-black border-b border-zinc-50 pb-0.5"><span class="truncate">${escape_html(fail.name)}</span><span class="text-zinc-400">${escape_html(fail.mins)}m</span></div>`);
			}
		} else {
			$$renderer.push("<!--[!-->");
			$$renderer.push(`<span class="text-[10px] font-bold text-zinc-300 italic text-center py-1">No data</span>`);
		}
		$$renderer.push(`<!--]--></div></div></div></header> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <datalist id="codes-list"><!--[-->`);
		const each_array_5 = ensure_array_like(failureCodes());
		for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
			let code = each_array_5[$$index_5];
			$$renderer.option({ value: code.value }, ($$renderer) => {
				$$renderer.push(`${escape_html(code.label)}`);
			});
		}
		$$renderer.push(`<!--]--></datalist>  <datalist id="master-parts-list"><!--[-->`);
		const each_array_6 = ensure_array_like(data.allParts);
		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let item = each_array_6[$$index_6];
			if (data.allRates.some((r) => r.PARTNUMBER === item.PARTNUMBER && r.MACHINE === activeMachine())) {
				$$renderer.push("<!--[0-->");
				$$renderer.option({ value: item.PARTNUMBER }, ($$renderer) => {
					$$renderer.push(`${escape_html(item.FAMILY)}`);
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></datalist> <div class="bg-white shadow-xl border border-zinc-200 overflow-x-auto"><table class="w-full text-left border-collapse table-fixed min-w-[1300px]"><thead><tr class="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-wider"><th class="p-3 w-[180px] border-r border-zinc-800">Datetime</th><th class="p-3 w-[110px] text-center border-r border-zinc-800">Part Number</th><th class="p-3 w-[175px] text-center border-r border-zinc-800 text-orange-400">Family</th><th class="p-3 w-[75px] text-center border-r border-zinc-800 text-zinc-400">Rate</th><th class="p-3 w-[75px] text-center border-r border-zinc-800 text-blue-400">Produced</th><th class="p-3 w-[75px] text-center border-r border-zinc-800 text-red-400">Fail</th><th class="p-3 w-[75px] text-center border-r border-zinc-800 text-zinc-400">Run Time</th><th class="p-3 w-[75px] text-center border-r border-zinc-800 text-red-400">Lost Time</th><th class="p-3 w-[300px] border-r border-zinc-800">Failure Code</th><th class="p-3 w-[250px]">Comments</th></tr></thead><tbody class="divide-y divide-zinc-200 font-sans text-[11px]"><!--[-->`);
		const each_array_7 = ensure_array_like(filteredEntries());
		for (let index = 0, $$length = each_array_7.length; index < $$length; index++) {
			let row = each_array_7[index];
			const d = getRefinedDate(row.DISPLAY_ID);
			const isFirstOfHour = index === 0 || filteredEntries()[index - 1].DISPLAY_ID !== row.DISPLAY_ID;
			const curHour = (data ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date()).getHours();
			const convertedHour = curHour % 12 === 0 ? 12 : curHour % 12;
			const curPeriod = curHour >= 12 ? "PM" : "AM";
			const targetLiveToken = `${String(convertedHour).padStart(2, "0")}:00 ${curPeriod}`;
			const rowMatch = row.DISPLAY_ID.match(/(\d{1,2}):(\d{2}):?(\d{2})?\s*(AM|PM)/i);
			const isLiveInterval = (rowMatch ? `${rowMatch[1].padStart(2, "0")}:00 ${rowMatch[4].toUpperCase()}` : "") === targetLiveToken;
			$$renderer.push(`<tr${attr_class(`hover:bg-zinc-50/80 border-l-4 transition-colors ${stringify(isFirstOfHour ? "border-transparent hover:border-orange-600" : "border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/30")} ${stringify(row.IS_GHOST ? "opacity-60 italic" : "")}`)}><td class="p-2 border-r border-zinc-100 bg-zinc-50/50 whitespace-nowrap overflow-hidden relative">`);
			if (isFirstOfHour) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex items-center gap-2"><div class="flex items-baseline gap-1"><span class="text-[9px] font-black text-orange-600 italic tracking-tighter">${escape_html(d.day)}</span> <span class="text-[9px] font-black text-zinc-400 tracking-tighter">${escape_html(d.month)} ${escape_html(d.num)}</span></div> <div class="w-px h-4 bg-zinc-200"></div> <div class="flex items-baseline gap-0.5"><span class="text-[14px] font-black text-zinc-900 tabular-nums leading-none tracking-tighter italic">${escape_html(d.time)}</span> <span class="text-[9px] font-black text-zinc-400 tracking-tighter">${escape_html(d.period)}</span></div></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="flex items-center h-full pl-6 gap-2"><div class="absolute left-4 top-0 bottom-0 w-0.5 border-l border-dashed border-zinc-300"></div> <span class="text-[8px] font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-xs uppercase tracking-wider font-sans border border-orange-200 animate-pulse">↳ CHANGEOVER DETECTED</span></div>`);
			}
			$$renderer.push(`<!--]--></td><td class="p-2 border-r border-zinc-100 text-center relative">`);
			if (row.REQUIRES_PART && !data.isReadOnly) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex flex-col items-center gap-1"><input type="text" list="master-parts-list" placeholder="SEARCH PART..." class="w-full bg-orange-50 border-2 border-orange-400 text-[10px] font-black p-1 text-center outline-none focus:bg-white transition-colors placeholder:text-orange-300 uppercase"${attr("name", `part-input-${row.IDENTIFIER}`)}/> <span class="text-[7px] font-bold text-orange-500 animate-pulse">REQUIRED</span></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="flex flex-col"><span class="font-mono text-xs text-zinc-900 font-bold">${escape_html(row.PARTNUMBER)}</span> `);
				if (row.IS_GHOST) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-[8px] font-bold text-blue-500 uppercase tracking-tighter">INHERITED</span>`);
				} else if (row.SERVER_SOURCE === "MANUAL_ENTRY") {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<span class="text-[8px] font-bold text-orange-500 uppercase tracking-tighter">MANUAL ENTRY</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></td><td class="p-2 font-mono text-xs text-zinc-900 text-center border-r border-zinc-100 uppercase">${escape_html(`${row.FAMILY || "-"} ${row?.SERVER_PROCESS?.toString()?.includes("SPI_S2") ? "(2)" : ""}`)}</td><td class="p-2 text-center font-mono text-xs text-zinc-400 border-r border-zinc-100">${escape_html(new Intl.NumberFormat().format(row.RATE || 0))}</td><td class="p-2 text-center font-mono text-xs text-blue-600 font-bold border-r border-zinc-100">${escape_html(new Intl.NumberFormat().format(row.PRODUCED || 0))}</td><td class="p-2 text-center font-mono text-xs text-red-600 border-r border-zinc-100">${escape_html(row.QUALITY?.fail || 0)}</td><td class="p-2 text-center font-mono text-xs text-zinc-400 italic border-r border-zinc-100"><span${attr_class(clsx$1(!isFirstOfHour ? "text-orange-600 font-bold" : ""))}>${escape_html(row.DURATION)}m</span></td><td${attr_class(`p-2 text-center font-mono text-xs font-black ${stringify(row.TIME_LOST > 0 ? "text-red-600 bg-red-50" : "text-zinc-200")} border-r border-zinc-100`)}>${escape_html(row.TIME_LOST)}m</td><td class="p-1 border-r border-zinc-100"><button${attr("disabled", data.isReadOnly || row.TIME_LOST <= 0 || isLiveInterval, true)}${attr_class(`w-full h-10 flex items-center justify-between px-3 text-[10px] font-black uppercase transition-all rounded-xs ${stringify(isLiveInterval ? "bg-zinc-100 text-zinc-400 border-l-4 border-zinc-300 cursor-not-allowed select-none" : row.TIME_LOST > 0 ? "bg-red-50 text-red-700 border-l-4 border-red-600 hover:bg-red-100/70 cursor-pointer" : "bg-zinc-50 text-zinc-400 cursor-pointer")}`)}><span class="truncate pr-2 text-left">`);
			if (isLiveInterval) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`🔒 WAITING FOR INTERVAL END...`);
			} else if (Array.isArray(row.TIME_LOST_COMMENT)) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`${escape_html(row.TIME_LOST_COMMENT.filter((f) => f.code && f.minutes > 0).map((f) => `${f.minutes}' ${f.code}`).join(", ") || "⚠️ NEED FAILURE")}`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`${escape_html(row.TIME_LOST_COMMENT || (row.TIME_LOST > 0 ? "⚠️ NEED FAILURE" : "---"))}`);
			}
			$$renderer.push(`<!--]--></span></button></td><td class="p-1"><input${attr("id", `comment-input-${stringify(row.IDENTIFIER)}`)} type="text"${attr("value", isLiveInterval ? "" : row.COMMENTS)}${attr("disabled", data.isReadOnly || row.IS_LOCKED || isLiveInterval, true)}${attr_class(`w-full bg-transparent border-0 text-[10px] font-bold p-2 outline-hidden uppercase rounded-xs transition-colors ${stringify(data.isReadOnly || row.IS_LOCKED || isLiveInterval ? "opacity-40 italic cursor-not-allowed bg-zinc-50" : "focus:bg-zinc-50")}`)}${attr("placeholder", isLiveInterval ? "🔒 WAITING FOR INTERVAL END..." : row.IS_LOCKED ? "INTERVAL LOCKED..." : "ADD NOTE...")}${attr("name", `comment-input-${row.IDENTIFIER}`)}/></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></main> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <footer class="max-w-7xl mx-auto p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System - Production Capture Console</footer>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DG4xs2WX.js.map
