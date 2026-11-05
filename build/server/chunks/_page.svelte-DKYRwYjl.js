import { a3 as attr_class, a4 as stringify, a6 as attr_style, a5 as escape_html, a2 as attr, a7 as ensure_array_like, X as derived, a8 as bind_props } from './dev-CSPWYH9f.js';
import { b as buildTimeline, P as PLANT_TZ } from './plantTime-CjpO2xUR.js';
import { e as extractHourMinute } from './captureFormat-5spFGeAz.js';
import { a as FINISH_ROUTES, c as isBoardPoolFamily, d as buildExitProcess, l as logArea, g as FINISH_LEVELS, h as BUILD_LEVELS, j as compareFamilyNames, B as BUILD_STREAMS } from './plantAreas-DImca8Fn.js';
import { R as RADAR_PROCESS_CHAIN, g as groupPlanByModule, b as planPace } from './productionPlan2-CiQespVH.js';
import { p as page } from './state-nCAFLkfF.js';
import './client-DZ8k5AXj.js';
import { c as captureHref } from './capturePath-R_tTjP2G.js';
import { i as isFailureTransit, n as normalizeLevel } from './pieceLevel-B94ZE9fG.js';
import { n as netExpected, p as programmedMinutes, c as codedLosses, i as isProgrammedCode, u as unplannedMinutes } from './downtime-Cgg3eN_G.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'jspdf';
import 'jspdf-autotable';
import './internal-KhZZ_anA.js';
import './index-DBqjc0Yf.js';

//#region src/lib/components/MainProductionChart.svelte
function MainProductionChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart.register(annotationPlugin, ChartDataLabels);
		let { trendData = [], filterHour = void 0, accentColor, isReadOnly, targetRate = 0 } = $$props;
		const productiveHours = derived(() => trendData.filter((t) => t.qty > 0));
		const realAverage = derived(() => productiveHours().length > 0 ? productiveHours().reduce((acc, curr) => acc + curr.qty, 0) / productiveHours().length : 0);
		const lastHourPerformance = derived(() => {
			if (productiveHours().length === 0) return null;
			const lastProductiveEntry = productiveHours()[productiveHours().length - 1];
			return {
				time: lastProductiveEntry.time,
				qty: lastProductiveEntry.qty,
				isAbove: lastProductiveEntry.qty >= realAverage()
			};
		});
		$$renderer.push(`<div class="relative w-full h-full">`);
		if (productiveHours().length > 0 && lastHourPerformance()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="absolute top-0 left-12 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1.5 rounded shadow-sm"><span class="text-[9px] font-black uppercase tracking-widest text-gray-400">vs Shift Average:</span> <div class="flex items-center gap-1"><span${attr_class(`text-[10px] font-black ${stringify(lastHourPerformance().isAbove ? "text-green-600" : "text-orange-500")}`)}>${escape_html(lastHourPerformance().isAbove ? "↑ ABOVE" : "↓ BELOW")}</span> <span class="text-[9px] font-mono text-gray-400">(${escape_html(Math.round(realAverage()))} PCS)</span></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <canvas></canvas></div>`);
		bind_props($$props, { filterHour });
	});
}
//#endregion
//#region src/lib/inventoryBalance.js
/** Same hold the dashboard uses between two processes: no negative balance, age from the hour it turned positive. */
function displayStamp(displayId) {
	if (!displayId) return 0;
	const date = String(displayId).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
	const time = String(displayId).match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
	if (!date || !time) return 0;
	let hours = parseInt(time[1], 10);
	const minutes = parseInt(time[2], 10) || 0;
	const ampm = time[3].toUpperCase();
	if (ampm === "PM" && hours !== 12) hours += 12;
	if (ampm === "AM" && hours === 12) hours = 0;
	return Date.UTC(Number(date[3]), Number(date[1]) - 1, Number(date[2]), hours, minutes);
}
function inventoryHold(upstream, downstream) {
	const deltas = /* @__PURE__ */ new Map();
	for (const [stamp, qty] of upstream || []) deltas.set(stamp, (deltas.get(stamp) || 0) + qty);
	for (const [stamp, qty] of downstream || []) deltas.set(stamp, (deltas.get(stamp) || 0) - qty);
	let balance = 0;
	let since = null;
	for (const stamp of [...deltas.keys()].sort((a, b) => a - b)) {
		const next = balance + deltas.get(stamp);
		if (next <= 0) {
			balance = 0;
			since = null;
		} else {
			if (balance === 0) since = stamp;
			balance = next;
		}
	}
	return {
		qty: balance,
		since
	};
}
//#endregion
//#region src/lib/deliveryBridge.js
function addQty(map, stamp, qty) {
	map.set(stamp, (map.get(stamp) || 0) + qty);
}
function oldest(stamps) {
	const real = stamps.filter((stamp) => stamp);
	if (!real.length) return null;
	return Math.min(...real);
}
/**
* Part-number balance from the family's last build step into the first finish step.
* Same hold as the rest of inventory. The family strip sums these rows.
*/
function deliveryPartHolds(logs, streamFilter = "ALL", routes = FINISH_ROUTES, accepted = null) {
	const types = streamFilter && streamFilter !== "ALL" && BUILD_STREAMS[streamFilter] ? [streamFilter] : Object.keys(BUILD_STREAMS);
	const wanted = new Set(types);
	const buckets = /* @__PURE__ */ new Map();
	let finishMeasured = false;
	for (const log of logs || []) {
		if (!wanted.has(log.TYPE) || !(log.PRODUCED > 0) || isFailureTransit(log, accepted)) continue;
		const area = logArea(log);
		const family = log.FAMILY || "UNKNOWN";
		const part = log.PARTNUMBER || "UNKNOWN";
		const key = `${log.TYPE}\u0000${family}\u0000${part}`;
		const exitProcess = buildExitProcess(log.TYPE, family);
		const entry = routes?.[log.TYPE]?.[0] || "";
		const isExit = area === "BUILD" && log.PROCESS === exitProcess;
		const isEntry = area === "FINISH" && entry && log.PROCESS === entry;
		if (!isExit && !isEntry) continue;
		if (isEntry) finishMeasured = true;
		if (!buckets.has(key)) buckets.set(key, {
			type: log.TYPE,
			family,
			part,
			exitProcess,
			entry,
			levels: {},
			exit: /* @__PURE__ */ new Map(),
			entryEvents: /* @__PURE__ */ new Map()
		});
		const bucket = buckets.get(key);
		const level = normalizeLevel(log.LEVEL);
		if (level) bucket.levels[level] = (bucket.levels[level] || 0) + log.PRODUCED;
		const stamp = displayStamp(log.DISPLAY_ID);
		addQty(isEntry ? bucket.entryEvents : bucket.exit, stamp, log.PRODUCED);
	}
	const parts = [];
	for (const bucket of buckets.values()) {
		const held = inventoryHold(bucket.exit, bucket.entryEvents);
		if (!held.qty) continue;
		parts.push({
			type: bucket.type,
			family: bucket.family,
			name: bucket.part,
			exitProcess: bucket.exitProcess,
			entry: bucket.entry,
			qty: held.qty,
			since: held.since,
			level: Object.entries(bucket.levels).sort((a, b) => b[1] - a[1])[0]?.[0] || ""
		});
	}
	return {
		parts,
		finishMeasured,
		types
	};
}
/**
* Pieces that left the family's last build step and have not entered final test.
* Same-day balance as the rest of inventory. With no finish intake, this is what Build finished.
*/
function buildDeliveryBridge(logs, streamFilter = "ALL", routes = FINISH_ROUTES, accepted = null) {
	const { parts, finishMeasured, types } = deliveryPartHolds(logs, streamFilter, routes, accepted);
	const streamRows = [];
	for (const type of types) {
		const typeParts = parts.filter((part) => part.type === type).map((part) => ({
			id: `${type}|${part.family}|${part.name}`,
			type,
			family: part.family,
			name: part.name,
			qty: part.qty,
			since: part.since,
			level: part.level
		}));
		const byFamily = /* @__PURE__ */ new Map();
		for (const part of typeParts) {
			if (!byFamily.has(part.family)) byFamily.set(part.family, []);
			byFamily.get(part.family).push(part);
		}
		const families = [...byFamily.entries()].sort((a, b) => compareFamilyNames(type, a[0], b[0])).map(([family, members]) => ({
			id: `${type}|${family}`,
			type,
			family,
			name: family,
			qty: members.reduce((sum, part) => sum + part.qty, 0),
			since: oldest(members.map((part) => part.since)),
			level: members.every((part) => part.level === members[0].level) ? members[0].level : "",
			parts: members.sort((a, b) => a.name.localeCompare(b.name, "en"))
		}));
		streamRows.push({
			id: type,
			type,
			name: type,
			qty: families.reduce((sum, family) => sum + family.qty, 0),
			since: oldest(families.map((family) => family.since)),
			families
		});
	}
	const focused = streamFilter && streamFilter !== "ALL";
	const rows = focused ? streamRows[0]?.families || [] : streamRows.filter((row) => row.qty > 0);
	return {
		focused,
		qty: streamRows.reduce((sum, row) => sum + row.qty, 0),
		since: oldest(streamRows.map((row) => row.since)),
		finishMeasured,
		rows
	};
}
//#endregion
//#region src/lib/finishArea.js
function clockLabel(displayId) {
	return String(displayId || "").match(/(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))/i)?.[1] || "";
}
function trendOf(logs) {
	const hourly = {};
	for (const log of logs) {
		const label = clockLabel(log.DISPLAY_ID);
		if (!label) continue;
		hourly[label] = (hourly[label] || 0) + (log.PRODUCED || 0);
	}
	const to24 = (label) => {
		const hour = parseInt(label.split(":")[0], 10);
		const isPM = label.includes("PM");
		let value = hour;
		if (isPM && hour !== 12) value += 12;
		if (!isPM && hour === 12) value = 0;
		return value < 6 ? value + 24 : value;
	};
	return Object.entries(hourly).map(([time, qty]) => ({
		time,
		qty
	})).sort((a, b) => to24(a.time) - to24(b.time));
}
function failureMinutes(logs) {
	const failureMap = {};
	const machineFailureMap = {};
	for (const log of logs) {
		for (const entry of codedLosses(log)) {
			if (isProgrammedCode(entry.code)) continue;
			failureMap[entry.code] = (failureMap[entry.code] || 0) + entry.minutes;
		}
		const unplanned = unplannedMinutes(log);
		if (unplanned <= 0) continue;
		const station = `${log.PROCESS} · ${log.MACHINE || "NO MACHINE"}`;
		machineFailureMap[station] = (machineFailureMap[station] || 0) + unplanned;
	}
	return {
		topFailures: Object.entries(failureMap).map(([name, mins]) => ({
			name,
			mins
		})).sort((a, b) => b.mins - a.mins).slice(0, 10),
		criticalMachines: Object.entries(machineFailureMap).map(([name, mins]) => ({
			name,
			mins
		})).sort((a, b) => b.mins - a.mins).slice(0, 8)
	};
}
function emptyCells(steps) {
	return Object.fromEntries(steps.map((step) => [step, 0]));
}
/**
* Finish dashboard for one operating window.
* streamSource: finish logs after the page filters, still every valuestream.
* kpiLogs: those logs after valuestream and process filters, without failure transit.
* tableLogs: rows for the volume and inventory tables.
*/
function finishAreaView({ streamSource = [], kpiLogs = [], tableLogs = [], stream = "ALL", familiesByType = {}, isReadOnly = false, dayBlocks = 1, isUnjustified = () => false, routes = FINISH_ROUTES, bridgeLogs = [], bypass = [], accepted = null }) {
	const routeFor = (type) => {
		const steps = routes?.[type];
		return Array.isArray(steps) ? steps : [];
	};
	const good = (log) => !isFailureTransit(log, accepted);
	const streamMap = Object.keys(BUILD_STREAMS).map((type) => {
		const typeLogs = streamSource.filter((log) => log.TYPE === type);
		return {
			type,
			produced: typeLogs.filter(good).reduce((sum, log) => sum + (log.PRODUCED || 0), 0),
			steps: routeFor(type).map((name) => {
				const stepLogs = typeLogs.filter((log) => log.PROCESS === name);
				const producedQty = stepLogs.reduce((sum, log) => sum + (log.PRODUCED || 0), 0);
				const rate = stepLogs.reduce((sum, log) => sum + netExpected(log), 0);
				return {
					name,
					efficiency: rate > 0 ? Math.round(producedQty / rate * 100) : 0,
					hasPending: stepLogs.some((log) => good(log) && isUnjustified(log)),
					hasData: stepLogs.length > 0
				};
			})
		};
	});
	const totalProduced = kpiLogs.reduce((sum, log) => sum + (log.PRODUCED || 0), 0);
	const totalRate = kpiLogs.reduce((sum, log) => sum + netExpected(log), 0);
	const programmed = kpiLogs.reduce((sum, log) => sum + programmedMinutes(log), 0);
	const seenBlocks = new Set(kpiLogs.map((log) => clockLabel(log.DISPLAY_ID)).filter(Boolean)).size;
	const projectedFinal = isReadOnly ? totalProduced : Math.round(totalProduced / (seenBlocks || 1) * dayBlocks);
	const unjustifiedLogs = kpiLogs.filter((log) => isUnjustified(log));
	const famMap = {};
	for (const log of kpiLogs) famMap[log.FAMILY] = (famMap[log.FAMILY] || 0) + (log.PRODUCED || 0);
	const statScope = stream && stream !== "ALL" ? streamSource.filter((log) => log.TYPE === stream) : streamSource;
	const stats = (stream && stream !== "ALL" ? routeFor(stream) : [...new Set(Object.values(routes || {}).flat())]).map((name) => {
		const stepLogs = statScope.filter((log) => log.PROCESS === name);
		const producedQty = stepLogs.reduce((sum, log) => sum + (log.PRODUCED || 0), 0);
		const rate = stepLogs.reduce((sum, log) => sum + netExpected(log), 0);
		const unjustified = stepLogs.filter((log) => good(log) && isUnjustified(log)).reduce((sum, log) => sum + (log.TIME_LOST || 0), 0);
		const stepProgrammed = stepLogs.reduce((sum, log) => sum + programmedMinutes(log), 0);
		return {
			name,
			efficiency: rate > 0 ? Math.round(producedQty / rate * 100) : 0,
			unjustified,
			programmed: stepProgrammed
		};
	});
	const losses = failureMinutes(kpiLogs);
	const selected = stream && stream !== "ALL" && BUILD_STREAMS[stream] ? stream : "";
	const selectedRoute = selected ? routeFor(selected) : [];
	const tables = !selected ? {
		volume: null,
		inventory: null,
		unconfigured: false
	} : selectedRoute.length ? {
		...finishTables(tableLogs, selected, familiesByType[selected] || [], selectedRoute, {
			bridgeLogs,
			bypass,
			routes,
			accepted
		}),
		unconfigured: false
	} : {
		volume: null,
		inventory: null,
		unconfigured: true
	};
	return {
		totalProduced,
		totalRate,
		programmedMinutes: programmed,
		projectedFinal,
		globalEfficiency: totalRate > 0 ? Math.round(totalProduced / totalRate * 100) : 0,
		unjustifiedCount: unjustifiedLogs.length,
		unjustifiedMins: unjustifiedLogs.reduce((sum, log) => sum + (log.TIME_LOST || 0), 0),
		trend: trendOf(kpiLogs),
		topFamilies: Object.entries(famMap).map(([name, qty]) => ({
			name,
			qty
		})).sort((a, b) => b.qty - a.qty).slice(0, 15),
		stats,
		streamMap,
		...losses,
		...tables
	};
}
function dominantLevel(levels, fallback) {
	return Object.entries(levels || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
}
function keptSteps(steps, names) {
	const bypass = new Set(names || []);
	return steps.filter((name, index) => index === 0 || index === steps.length - 1 || !bypass.has(name));
}
function handoffColumns(type, entry, families, holds) {
	if (!entry) return [];
	const exits = /* @__PURE__ */ new Set();
	const fallback = buildExitProcess(type, "");
	if (fallback && fallback !== entry) exits.add(fallback);
	for (const family of families) {
		if (isBoardPoolFamily(family)) continue;
		const exit = buildExitProcess(type, family);
		if (exit && exit !== entry) exits.add(exit);
	}
	for (const hold of holds) if (hold.exitProcess && hold.exitProcess !== entry) exits.add(hold.exitProcess);
	const order = BUILD_STREAMS[type] || [];
	return [...exits].sort((a, b) => {
		const left = order.indexOf(a);
		const right = order.indexOf(b);
		return (left < 0 ? 99 : left) - (right < 0 ? 99 : right) || a.localeCompare(b, "en");
	}).map((exit) => ({
		key: `${exit}|${entry}`,
		label: `${exit} → ${entry}`,
		exit,
		title: "Same balance as Available for final test, by part number"
	}));
}
function finishTables(logs, type, knownFamilies, steps, { bridgeLogs = [], bypass = [], routes = FINISH_ROUTES, accepted = null } = {}) {
	const columns = steps.map((step) => ({
		key: step,
		label: step
	}));
	const byPart = /* @__PURE__ */ new Map();
	for (const log of logs) {
		if (log.TYPE !== type || !(log.PRODUCED > 0) || !steps.includes(log.PROCESS) || isFailureTransit(log, accepted)) continue;
		const family = log.FAMILY || "UNKNOWN";
		const part = log.PARTNUMBER || "UNKNOWN";
		const key = `${family}\u0000${part}`;
		if (!byPart.has(key)) byPart.set(key, {
			family,
			part,
			levels: {},
			cells: emptyCells(steps),
			events: Object.fromEntries(steps.map((step) => [step, /* @__PURE__ */ new Map()]))
		});
		const bucket = byPart.get(key);
		bucket.cells[log.PROCESS] += log.PRODUCED;
		const level = normalizeLevel(log.LEVEL);
		if (level) bucket.levels[level] = (bucket.levels[level] || 0) + log.PRODUCED;
		const stamp = displayStamp(log.DISPLAY_ID);
		const events = bucket.events[log.PROCESS];
		events.set(stamp, (events.get(stamp) || 0) + log.PRODUCED);
	}
	const families = new Set(knownFamilies);
	for (const bucket of byPart.values()) families.add(bucket.family);
	const rows = [...families].filter((family) => {
		return [...byPart.values()].some((bucket) => bucket.family === family) || !isBoardPoolFamily(family);
	}).sort((a, b) => compareFamilyNames(type, a, b)).map((family) => {
		const parts = [...byPart.values()].filter((bucket) => bucket.family === family).sort((a, b) => a.part.localeCompare(b.part, "en")).map((bucket) => ({
			kind: "part",
			id: `FIN|${type}|${family}|${bucket.part}`,
			name: bucket.part,
			family,
			level: Object.entries(bucket.levels).sort((a, b) => b[1] - a[1])[0]?.[0] || "MODULE",
			cells: bucket.cells,
			events: bucket.events
		}));
		const cells = emptyCells(steps);
		for (const part of parts) for (const step of steps) cells[step] += part.cells[step] || 0;
		return {
			kind: "group",
			id: `FIN|${type}|${family}`,
			name: family,
			family,
			cells,
			children: parts,
			unused: /* @__PURE__ */ new Set()
		};
	});
	const entry = steps[0] || "";
	const holds = deliveryPartHolds(bridgeLogs, type, routes, accepted).parts.filter((hold) => !isBoardPoolFamily(hold.family));
	const holdByPart = new Map(holds.map((hold) => [`${hold.family}\u0000${hold.name}`, hold]));
	const handoff = handoffColumns(type, entry, [...families], holds);
	const sequence = keptSteps(steps, bypass);
	const gapColumns = [];
	const gaps = [];
	for (let index = 0; index < sequence.length - 1; index++) {
		const from = sequence[index];
		const to = sequence[index + 1];
		const fromIndex = steps.indexOf(from);
		const toIndex = steps.indexOf(to);
		const skipped = steps.slice(fromIndex + 1, toIndex);
		gapColumns.push({
			key: `${from}|${to}`,
			label: `${from} → ${to}`,
			title: skipped.length ? `Bypasses ${skipped.join(", ")} for inventory` : ""
		});
		gaps.push([from, to]);
	}
	const inventoryColumns = [...handoff, ...gapColumns];
	const inventoryFamilies = new Set(families);
	for (const hold of holds) inventoryFamilies.add(hold.family);
	const inventoryRows = [...inventoryFamilies].filter((family) => !isBoardPoolFamily(family)).sort((a, b) => compareFamilyNames(type, a, b)).map((family) => {
		const exit = buildExitProcess(type, family);
		const unused = new Set(handoff.filter((column) => column.exit !== exit).map((column) => column.key));
		const names = /* @__PURE__ */ new Set();
		for (const bucket of byPart.values()) if (bucket.family === family) names.add(bucket.part);
		for (const hold of holds) if (hold.family === family) names.add(hold.name);
		const children = [...names].sort((a, b) => a.localeCompare(b, "en")).map((part) => {
			const bucket = byPart.get(`${family}\u0000${part}`);
			const hold = holdByPart.get(`${family}\u0000${part}`);
			const cells = {};
			const ages = {};
			if (hold?.qty) {
				const key = `${hold.exitProcess}|${hold.entry || entry}`;
				cells[key] = hold.qty;
				if (hold.since) ages[key] = hold.since;
			}
			if (bucket) for (const [from, to] of gaps) {
				const held = inventoryHold(bucket.events[from], bucket.events[to]);
				if (!held.qty) continue;
				cells[`${from}|${to}`] = held.qty;
				if (held.since) ages[`${from}|${to}`] = held.since;
			}
			if (!Object.keys(cells).length) return null;
			return {
				kind: "part",
				id: `FIN|${type}|${family}|${part}`,
				name: part,
				family,
				level: bucket ? dominantLevel(bucket.levels, "MODULE") : hold?.level || "BOARD",
				cells,
				ages,
				unused
			};
		}).filter(Boolean);
		if (!children.length) return null;
		const cells = {};
		for (const child of children) for (const [key, qty] of Object.entries(child.cells)) cells[key] = (cells[key] || 0) + qty;
		return {
			kind: "group",
			id: `FIN|${type}|${family}`,
			name: family,
			family,
			cells,
			children,
			unused
		};
	}).filter(Boolean);
	return {
		volume: {
			type,
			columns,
			rows,
			showZeros: true
		},
		inventory: {
			type,
			columns: inventoryColumns,
			rows: inventoryRows,
			pending: inventoryColumns.length === 0
		}
	};
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const acceptedLevels = derived(() => new Set(page.data.acceptedLevels || []));
		function failureTransit(log) {
			return isFailureTransit(log, acceptedLevels());
		}
		const filterType = derived(() => {
			const value = page.url.searchParams.get("stream");
			return value && data.streams?.[value] ? value : "ALL";
		});
		const plantArea = derived(() => page.url.searchParams.get("area") === "finish" ? "FINISH" : "BUILD");
		const finishRoutes = derived(() => data.finishRoutes && Object.keys(data.finishRoutes).length ? data.finishRoutes : FINISH_ROUTES);
		let tableView = "volume";
		let filterProcess = "ALL";
		let filterHour = "ALL";
		let filterShift = "ALL";
		let filterFailure = "ALL";
		let filterFamily = "ALL";
		let tableFamily = "ALL";
		let tableLevel = "ALL";
		let tablePart = "";
		let volumeFrom = "";
		let volumeTo = "";
		let planUploading = false;
		const isAdmin = derived(() => page.data.user?.role === "ADMIN");
		const volumeRangeActive = derived(() => Boolean(volumeFrom));
		const hasActiveFilters = derived(() => filterType() !== "ALL" || filterProcess !== "ALL" || filterHour !== "ALL" || filterShift !== "ALL" || filterFailure !== "ALL" || filterFamily !== "ALL");
		function timeLabel(displayId) {
			return displayId?.match(/(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM))/i)?.[1] || "";
		}
		function isUnjustified(log) {
			if (!(Number(log.TIME_LOST) > 0)) return false;
			const comment = log.TIME_LOST_COMMENT;
			if (Array.isArray(comment)) return !comment.some((f) => f?.code && Number(f.minutes) > 0);
			if (typeof comment === "string") return comment.trim() === "";
			return true;
		}
		const breadcrumb = derived(() => {
			const datePart = data.selectedDate;
			const areaLabel = plantArea() === "FINISH" ? "FINISH" : "BUILD";
			if (!hasActiveFilters()) return `${datePart} > ${areaLabel}`;
			const path = [
				datePart,
				areaLabel,
				filterType() === "ALL" ? "PLANT" : filterType()
			];
			if (filterHour !== "ALL") path.push(filterHour);
			return path.join(" > ");
		});
		const activeData = derived(() => {
			let scoped = data.logs.filter((log) => logArea(log) === "BUILD");
			if (filterHour !== "ALL") scoped = scoped.filter((l) => timeLabel(l.DISPLAY_ID) === filterHour);
			const streamSource = scoped;
			if (filterType() !== "ALL") scoped = scoped.filter((l) => l.TYPE === filterType());
			let filteredLogs = scoped;
			filteredLogs = filteredLogs.filter((l) => !failureTransit(l));
			const unjustifiedLogs = filteredLogs.filter(isUnjustified);
			const unjustifiedMins = unjustifiedLogs.reduce((a, l) => a + l.TIME_LOST, 0);
			const totalProduced = filteredLogs.reduce((acc, l) => acc + (l.PRODUCED || 0), 0);
			const totalRate = filteredLogs.reduce((acc, l) => acc + netExpected(l), 0);
			const programmedMins = filteredLogs.reduce((acc, l) => acc + programmedMinutes(l), 0);
			const seenBlocks = new Set(filteredLogs.map((l) => timeLabel(l.DISPLAY_ID)).filter(Boolean)).size;
			const dayBlocks = buildTimeline(!!data.isSpecialDay).length || 1;
			const projectedFinal = data.isReadOnly ? totalProduced : Math.round(totalProduced / (seenBlocks || 1) * dayBlocks);
			const failureMap = {};
			const machineFailureMap = {};
			const famMap = {};
			filteredLogs.forEach((l) => {
				for (const entry of codedLosses(l)) {
					if (isProgrammedCode(entry.code)) continue;
					failureMap[entry.code] = (failureMap[entry.code] || 0) + entry.minutes;
				}
				const unplanned = unplannedMinutes(l);
				if (unplanned > 0) {
					const station = `${l.PROCESS} · ${l.MACHINE || "NO MACHINE"}`;
					machineFailureMap[station] = (machineFailureMap[station] || 0) + unplanned;
				}
			});
			filteredLogs.forEach((l) => {
				famMap[l.FAMILY] = (famMap[l.FAMILY] || 0) + (l.PRODUCED || 0);
			});
			const hourlyMap = {};
			filteredLogs.forEach((l) => {
				const label = timeLabel(l.DISPLAY_ID);
				if (!label) return;
				if (!hourlyMap[label]) hourlyMap[label] = 0;
				hourlyMap[label] += l.PRODUCED;
			});
			const trend = Object.entries(hourlyMap).map(([time, qty]) => ({
				time,
				qty
			})).sort((a, b) => {
				const to24 = (s) => {
					const h = parseInt(s.split(":")[0]);
					const isPM = s.includes("PM");
					let hr = h;
					if (isPM && h !== 12) hr += 12;
					if (!isPM && h === 12) hr = 0;
					return hr < 6 ? hr + 24 : hr;
				};
				return to24(a.time) - to24(b.time);
			});
			const streamMap = Object.entries(data.streams).map(([type, steps]) => {
				const typeLogs = streamSource.filter((l) => l.TYPE === type);
				return {
					type,
					produced: typeLogs.filter((l) => !failureTransit(l)).reduce((sum, log) => sum + (log.PRODUCED || 0), 0),
					steps: steps.map((s) => {
						const stepLogs = typeLogs.filter((l) => l.PROCESS === s);
						const d = stepLogs.reduce((acc, curr) => {
							acc.p += curr.PRODUCED;
							acc.r += netExpected(curr);
							return acc;
						}, {
							p: 0,
							r: 0
						});
						return {
							name: s,
							efficiency: d.r > 0 ? Math.round(d.p / d.r * 100) : 0,
							hasPending: stepLogs.some(isUnjustified),
							hasData: stepLogs.length > 0
						};
					})
				};
			});
			const procMap = {};
			scoped.forEach((l) => {
				if (filterType() !== "ALL" && l.TYPE !== filterType()) return;
				if (!procMap[l.PROCESS]) procMap[l.PROCESS] = {
					name: l.PROCESS,
					p: 0,
					r: 0,
					uMins: 0,
					programmed: 0
				};
				procMap[l.PROCESS].p += l.PRODUCED;
				procMap[l.PROCESS].r += netExpected(l);
				procMap[l.PROCESS].programmed += programmedMinutes(l);
				if (!failureTransit(l) && isUnjustified(l)) procMap[l.PROCESS].uMins += l.TIME_LOST;
			});
			const volumeMerges = {
				RADAR: [["MOL", "PROGRAMMING"]],
				CONTROLLER: [["SPRAYCOAT", "SPRAYCOAT_L3"], ["CONT_LOADPCB", "SCREWDRIVE"]]
			};
			const volumeColumns = {
				RADAR: [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "XRAY",
						label: "XRAY"
					},
					{
						key: "MOL+PROGRAMMING",
						label: "PROGRAMMING"
					},
					{
						key: "EDGEBONDAOI",
						label: "EDGEBOND"
					},
					{
						key: "ROUTERMILLING",
						label: "ROUTERMILLING"
					},
					{
						key: "ANTENNAATTACH",
						label: "ANTENNA ATTACH"
					},
					{
						key: "LEAKTEST",
						label: "LEAKTEST"
					}
				],
				CONTROLLER: [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "AOI_PTH",
						label: "PTH"
					},
					{
						key: "XRAY",
						label: "XRAY"
					},
					{
						key: "PROGRAMMING",
						label: "PROGRAMMING"
					},
					{
						key: "EDGEBONDAOI",
						label: "EDGEBOND"
					},
					{
						key: "SPRAYCOAT+SPRAYCOAT_L3",
						label: "CONFORMAL"
					},
					{
						key: "CONT_LOADPCB+SCREWDRIVE",
						label: "SCREWDRIVE"
					}
				],
				"VOLVO DHU": [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "AOI_PTH",
						label: "PTH"
					},
					{
						key: "XRAY",
						label: "XRAY"
					},
					{
						key: "ROUTERMILLING",
						label: "ROUTERMILLING"
					},
					{
						key: "ICT",
						label: "ICT"
					}
				],
				"MRR ADAS": [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "XRAY",
						label: "XRAY"
					},
					{
						key: "SINGULATION",
						label: "SINGULATION"
					},
					{
						key: "ICT",
						label: "ICT"
					},
					{
						key: "MOL",
						label: "MOL"
					},
					{
						key: "LGA_CONTAINMENT",
						label: "LGA CONTAINMENT"
					}
				],
				IFV300: [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "XRAY",
						label: "XRAY"
					},
					{
						key: "SINGULATION",
						label: "SINGULATION"
					},
					{
						key: "ICT",
						label: "ICT"
					},
					{
						key: "MOL",
						label: "MOL"
					}
				],
				IFV600: [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "AOI_PTH",
						label: "PTH"
					},
					{
						key: "XRAY",
						label: "XRAY"
					},
					{
						key: "PROGRAMMING",
						label: "PROGRAMMING"
					},
					{
						key: "ICT",
						label: "ICT"
					}
				],
				"VOLVO VIU": [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "XRAY",
						label: "XRAY"
					}
				],
				"GM DMS": [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "XRAY",
						label: "XRAY"
					},
					{
						key: "ICT",
						label: "ICT"
					}
				],
				CAMERA: [
					{
						key: "BOARD_LABEL",
						label: "LASER ETCH"
					},
					{
						key: "SPI_S1",
						label: "SMT (1)"
					},
					{
						key: "SPI_S2",
						label: "SMT (2)"
					},
					{
						key: "UNDERFILLAOI",
						label: "UNDERFILL"
					},
					{
						key: "AOI_PTH",
						label: "PTH"
					},
					{
						key: "ICT",
						label: "ICT"
					}
				]
			};
			const countedSlots = new Set(buildTimeline(!!data.isSpecialDay).map((slot) => slot.time));
			const volumeTables = Object.entries(data.streams).filter(([type]) => type === filterType()).map(([type]) => {
				const columns = volumeColumns[type] || [];
				let source = volumeRangeActive() ? [].filter((log) => logArea(log) === "BUILD") : filteredLogs;
				if (volumeRangeActive()) ;
				const typeLogs = source.filter((l) => {
					if (failureTransit(l)) return false;
					if (l.TYPE !== type || !(l.PRODUCED > 0)) return false;
					if (volumeRangeActive()) return true;
					return countedSlots.has(extractHourMinute(l.DISPLAY_ID));
				});
				const columnKey = (server) => {
					const group = (volumeMerges[type] || []).find((servers) => servers.includes(server));
					return group ? group.join("+") : server;
				};
				const partBuckets = /* @__PURE__ */ new Map();
				for (const log of typeLogs) {
					const family = log.FAMILY;
					const part = log.PARTNUMBER || "UNKNOWN";
					const key = `${family}\u0000${part}`;
					if (!partBuckets.has(key)) partBuckets.set(key, {
						family,
						part,
						cells: {},
						total: 0,
						levels: {}
					});
					const bucket = partBuckets.get(key);
					const column = columnKey(log.SERVER_PROCESS);
					bucket.cells[column] = (bucket.cells[column] || 0) + log.PRODUCED;
					bucket.total += log.PRODUCED;
					const level = inventoryLevel(log.LEVEL);
					if (level) bucket.levels[level] = (bucket.levels[level] || 0) + log.PRODUCED;
				}
				const partsByFamily = /* @__PURE__ */ new Map();
				for (const bucket of partBuckets.values()) {
					if (!partsByFamily.has(bucket.family)) partsByFamily.set(bucket.family, []);
					const level = Object.entries(bucket.levels).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
					partsByFamily.get(bucket.family).push({
						kind: "part",
						id: `VOL|${type}|${bucket.family}|${bucket.part}`,
						name: bucket.part,
						family: bucket.family,
						level,
						cells: bucket.cells,
						total: bucket.total,
						unused: unusedVolumeKeys(type, bucket.family)
					});
				}
				const rows = [...partsByFamily.keys()].sort((a, b) => compareFamilies(type, a, b)).map((family) => {
					const parts = partsByFamily.get(family).sort((a, b) => a.name.localeCompare(b.name, "en"));
					const cells = {};
					let total = 0;
					for (const part of parts) {
						for (const [key, qty] of Object.entries(part.cells)) cells[key] = (cells[key] || 0) + qty;
						total += part.total;
					}
					return {
						family,
						cells,
						total,
						unused: unusedVolumeKeys(type, family),
						children: parts
					};
				});
				return {
					type,
					columns,
					rows: type === "CONTROLLER" ? groupControllerFamilies(columns, rows) : type === "RADAR" ? groupRadarFamilies(columns, rows) : rows.map((row) => volumeVariantNode(row))
				};
			});
			const inventorySource = (volumeRangeActive() ? [] : data.logs).filter((log) => logArea(log) === "BUILD");
			const subtypeLinks = buildSubtypeLinks(data.conversions);
			const inventoryTables = Object.entries(data.streams).filter(([type]) => type === filterType()).map(([type, steps]) => {
				const columns = [];
				const gaps = [];
				const bypass = new Set(middleBypass(steps, data.inventoryBypass?.[type]));
				const sequence = steps.filter((name, index) => index === 0 || index === steps.length - 1 || !bypass.has(name));
				const pushGap = (from, to, skipped = []) => {
					const label = from === "LASER ETCH" && to === "SMT" ? "LASER ETCH → SMT (1)" : `${from} → ${to}`;
					const key = `${from}|${to}`;
					if (columns.some((col) => col.key === key)) return;
					columns.push({
						key,
						label,
						title: skipped.length ? `Bypasses ${skipped.join(", ")} for inventory` : ""
					});
					gaps.push([from, to]);
					if (from === "LASER ETCH" && to === "SMT") columns.push({
						key: "SPI_S1|SPI_S2",
						label: "SMT (1) → SMT (2)"
					});
				};
				const pushSequence = () => {
					for (let i = 0; i < sequence.length - 1; i++) {
						const from = sequence[i];
						const to = sequence[i + 1];
						const fromIndex = steps.indexOf(from);
						const toIndex = steps.indexOf(to);
						const skipped = steps.slice(fromIndex + 1, toIndex);
						if (!skipped.length && type === "CAMERA" && from === "SMT" && to === "UNDERFILL") {
							columns.push({
								key: "SMT|PTH",
								label: "SMT → PTH"
							});
							gaps.push(["SMT", "PTH"]);
						}
						if (!skipped.length && type === "CONTROLLER" && from === "CONFORMAL" && to === "SCREWDRIVE") {
							columns.push({
								key: "PROGRAMMING|CONFORMAL",
								label: "PROGRAMMING → CONFORMAL"
							});
							gaps.push(["PROGRAMMING", "CONFORMAL"]);
						}
						pushGap(from, to, skipped);
					}
				};
				if (type === "IFV600" && !bypass.size) for (const [from, to] of [
					["LASER ETCH", "SMT"],
					["SMT", "PTH"],
					["SMT", "XRAY"],
					["PTH", "XRAY"],
					["XRAY", "PROGRAMMING"],
					["XRAY", "ICT"]
				]) pushGap(from, to);
				else if (type === "IFV600") {
					for (const [from, to] of [
						["LASER ETCH", "SMT"],
						["SMT", "PTH"],
						["SMT", "XRAY"],
						["PTH", "XRAY"],
						["XRAY", "PROGRAMMING"],
						["XRAY", "ICT"]
					]) {
						if (bypass.has(from) || bypass.has(to)) continue;
						pushGap(from, to);
					}
					pushSequence();
				} else pushSequence();
				const byPart = /* @__PURE__ */ new Map();
				for (const log of inventorySource) {
					if (log.TYPE !== type || !(log.PRODUCED > 0) || !steps.includes(log.PROCESS) || failureTransit(log)) continue;
					const level = inventoryLevel(log.LEVEL);
					const family = log.FAMILY || "UNKNOWN";
					const part = log.PARTNUMBER || "UNKNOWN";
					const stamp = inventoryStamp(log.DISPLAY_ID);
					const key = `${family}\u0000${part}`;
					if (!byPart.has(key)) byPart.set(key, {
						family,
						part,
						level,
						events: {},
						eventsS1: {},
						eventsS2: {}
					});
					const bucket = byPart.get(key);
					if (!bucket.events[log.PROCESS]) bucket.events[log.PROCESS] = /* @__PURE__ */ new Map();
					bucket.events[log.PROCESS].set(stamp, (bucket.events[log.PROCESS].get(stamp) || 0) + log.PRODUCED);
					if (isSpiS1(log.SERVER_PROCESS)) {
						if (!bucket.eventsS1[log.PROCESS]) bucket.eventsS1[log.PROCESS] = /* @__PURE__ */ new Map();
						bucket.eventsS1[log.PROCESS].set(stamp, (bucket.eventsS1[log.PROCESS].get(stamp) || 0) + log.PRODUCED);
					}
					if (isSpiS2(log.SERVER_PROCESS)) {
						if (!bucket.eventsS2[log.PROCESS]) bucket.eventsS2[log.PROCESS] = /* @__PURE__ */ new Map();
						bucket.eventsS2[log.PROCESS].set(stamp, (bucket.eventsS2[log.PROCESS].get(stamp) || 0) + log.PRODUCED);
					}
				}
				const bucketsByPart = /* @__PURE__ */ new Map();
				for (const bucket of byPart.values()) {
					if (!bucketsByPart.has(bucket.part)) bucketsByPart.set(bucket.part, []);
					bucketsByPart.get(bucket.part).push(bucket);
				}
				const eventsFor = (part, pick) => (bucketsByPart.get(part) || []).map(pick).filter(Boolean);
				for (const bucket of byPart.values()) {
					const moduleUsesS2 = type === "CONTROLLER" || type === "MRR ADAS" || type === "IFV300" || type === "IFV600" || /^KIA\b/i.test(bucket.family);
					if (bucket.level === "RAW BOARD") {
						const shared = sharedRawPool(bucket.family);
						const boards = shared ? null : subtypeLinks.rawToS1.get(bucket.part);
						const consumed = shared ? mergeEventMaps([...byPart.values()].filter((row) => row.level === "BOARD" && shared.test.test(row.family) && !sharedRawPool(row.family)).map((row) => shared.useS2 ? row.eventsS2.SMT : row.eventsS1.SMT)) : boards?.size ? mergeEventMaps([...boards].flatMap((part) => eventsFor(part, (row) => row.eventsS1.SMT))) : null;
						if (consumed) {
							const held = inventoryHold(bucket.events["LASER ETCH"], consumed);
							if (held.qty) {
								bucket.boundary = { "LASER ETCH|SMT": held.qty };
								if (held.since) bucket.boundaryAges = { "LASER ETCH|SMT": held.since };
							}
						}
					}
					const usesSecondSmt = type !== "RADAR" || /^KIA\b/i.test(bucket.family);
					if (bucket.level === "BOARD" && usesSecondSmt) {
						const nextBoards = subtypeLinks.s1ToS2.get(bucket.part);
						if (nextBoards?.size) {
							const consumed = mergeEventMaps([...nextBoards].flatMap((part) => eventsFor(part, (row) => row.eventsS2.SMT)));
							const held = inventoryHold(bucket.eventsS1.SMT, consumed);
							if (held.qty) {
								bucket.boundary = {
									...bucket.boundary || {},
									"SPI_S1|SPI_S2": held.qty
								};
								if (held.since) bucket.boundaryAges = {
									...bucket.boundaryAges || {},
									"SPI_S1|SPI_S2": held.since
								};
							}
						}
					}
					if (bucket.level === "BOARD") {
						const modules = moduleUsesS2 ? subtypeLinks.boardToModulesS2.get(bucket.part) : subtypeLinks.boardToModulesS1.get(bucket.part);
						const linked = (processName) => mergeEventMaps([bucket.events[processName], ...[...modules || []].flatMap((part) => eventsFor(part, (row) => row.events[processName]))]);
						if (type === "MRR ADAS" || type === "IFV300") {
							const boundary = {};
							const ages = {};
							const camera = type === "IFV300" && /^IFV300 CAMERA\b/i.test(bucket.family);
							for (const [from, to] of gaps) {
								if (!handoffSpan(from, to)) continue;
								if (camera && (from === "ICT" || to === "ICT" || from === "MOL" || to === "MOL")) continue;
								const direct = steps.indexOf(to) === steps.indexOf(from) + 1;
								let upstream;
								let downstream;
								if (direct && from === "XRAY" && to === "SINGULATION") {
									upstream = bucket.events.XRAY;
									downstream = camera ? bucket.events.SINGULATION : linked("SINGULATION");
								} else if (direct && from === "SINGULATION" && to === "ICT") {
									upstream = camera ? bucket.events.SINGULATION : linked("SINGULATION");
									downstream = bucket.events.ICT;
								} else if (direct && from === "ICT" && to === "MOL") {
									upstream = bucket.events.ICT;
									downstream = linked("MOL");
								} else {
									upstream = from === "SINGULATION" && !camera ? linked(from) : bucket.events[from];
									downstream = linked(to);
								}
								const held = inventoryHold(upstream, downstream);
								if (!held.qty) continue;
								boundary[`${from}|${to}`] = held.qty;
								if (held.since) ages[`${from}|${to}`] = held.since;
							}
							if (Object.keys(boundary).length) {
								bucket.boundary = {
									...bucket.boundary || {},
									...boundary
								};
								bucket.boundaryAges = {
									...bucket.boundaryAges || {},
									...ages
								};
							}
						} else if (type !== "IFV300" && type !== "VOLVO VIU" && type !== "GM DMS" && type !== "CAMERA" && !(type === "IFV600" && /^IFV600 CAMERA\b/i.test(bucket.family))) {
							const held = inventoryHold(bucket.events.XRAY, linked("PROGRAMMING"));
							if (held.qty) {
								bucket.boundary = {
									...bucket.boundary || {},
									"XRAY|PROGRAMMING": held.qty
								};
								if (held.since) bucket.boundaryAges = {
									...bucket.boundaryAges || {},
									"XRAY|PROGRAMMING": held.since
								};
							}
						}
					}
				}
				const byFamily = /* @__PURE__ */ new Map();
				for (const bucket of byPart.values()) {
					const cells = {};
					const ages = {};
					const bypassEdgebond = type === "CONTROLLER" && skipsEdgebond(bucket.family);
					const cameraSkipsIct = type === "IFV300" && /^IFV300 CAMERA\b/i.test(bucket.family);
					const ifv600Camera = type === "IFV600" && /^IFV600 CAMERA\b/i.test(bucket.family);
					const ifv600Main = type === "IFV600" && /^IFV600 MAIN\b/i.test(bucket.family);
					const gmEcu = type === "GM DMS" && /^GM DMS ECU\b/i.test(bucket.family);
					const omnivision = type === "CAMERA" && /OMNIVISION/i.test(bucket.family);
					const degreesCamera = type === "CAMERA" && !omnivision;
					for (const [from, to] of gaps) {
						const stage = gapLevel(type, from, to);
						if (stage === "HANDOFF" || stage === "RAW BOARD" || stage !== bucket.level) continue;
						if (bypassEdgebond && (from === "EDGEBOND" || to === "EDGEBOND")) continue;
						if (type === "CONTROLLER" && from === "PROGRAMMING" && to === "CONFORMAL" && !bypassEdgebond) continue;
						if (cameraSkipsIct && (from === "ICT" || to === "ICT" || from === "MOL" || to === "MOL")) continue;
						if (ifv600Camera && (from === "PTH" || to === "PTH" || from === "PROGRAMMING" || to === "PROGRAMMING")) continue;
						if (ifv600Main && (from === "SMT" && to === "XRAY" || from === "ICT" || to === "ICT")) continue;
						if (gmEcu && (from === "XRAY" || to === "XRAY" || from === "ICT" || to === "ICT")) continue;
						if (degreesCamera && (from === "UNDERFILL" || to === "UNDERFILL")) continue;
						if (omnivision && from === "SMT" && to === "PTH") continue;
						let upstream = bucket.events[from];
						const downstream = bucket.events[to];
						if ((type === "CONTROLLER" || type === "VOLVO DHU" || type === "IFV600" || type === "CAMERA") && from === "SMT" && to === "PTH") upstream = bucket.eventsS2[from];
						if (type === "CAMERA" && from === "SMT" && to === "UNDERFILL") upstream = bucket.eventsS2[from];
						if (type === "RADAR" && from === "SMT" && to === "XRAY") upstream = /^KIA\b/i.test(bucket.family) ? bucket.eventsS2[from] : bucket.eventsS1[from];
						if (from === "SMT" && steps.indexOf(to) > steps.indexOf(from) + 1) {
							if (type === "RADAR") upstream = /^KIA\b/i.test(bucket.family) ? bucket.eventsS2[from] : bucket.eventsS1[from];
							else if (type === "CONTROLLER" || type === "VOLVO DHU" || type === "IFV600" || type === "CAMERA" || type === "MRR ADAS" || type === "IFV300" || type === "VOLVO VIU" || type === "GM DMS") upstream = bucket.eventsS2[from];
						}
						if (type === "MRR ADAS" && from === "SMT" && to === "XRAY") upstream = bucket.eventsS2[from];
						if (type === "IFV300" && from === "SMT" && to === "XRAY") upstream = bucket.eventsS2[from];
						if (type === "IFV600" && from === "SMT" && to === "XRAY") upstream = bucket.eventsS2[from];
						if (type === "VOLVO VIU" && from === "SMT" && to === "XRAY") upstream = bucket.eventsS2[from];
						if (type === "GM DMS" && from === "SMT" && to === "XRAY") upstream = bucket.eventsS2[from];
						const held = inventoryHold(upstream, downstream);
						if (held.qty) {
							cells[`${from}|${to}`] = held.qty;
							if (held.since) ages[`${from}|${to}`] = held.since;
						}
					}
					if (bypassEdgebond && bucket.level === "MODULE") {
						const held = inventoryHold(bucket.events.PROGRAMMING, bucket.events.CONFORMAL);
						if (held.qty) {
							cells["PROGRAMMING|CONFORMAL"] = held.qty;
							if (held.since) ages["PROGRAMMING|CONFORMAL"] = held.since;
						}
					}
					if (bucket.boundary) Object.assign(cells, bucket.boundary);
					if (bucket.boundaryAges) Object.assign(ages, bucket.boundaryAges);
					if (!Object.keys(cells).length) continue;
					if (!byFamily.has(bucket.family)) byFamily.set(bucket.family, []);
					byFamily.get(bucket.family).push({
						kind: "part",
						id: `INV|${type}|${bucket.family}|${bucket.part}`,
						name: bucket.part,
						family: bucket.family,
						level: bucket.level,
						cells,
						ages,
						unused: unusedInventoryKeys(type, bucket.family, columns)
					});
				}
				return {
					type,
					columns,
					rows: groupInventoryRows(type, [...new Set(byFamily.keys())].sort((a, b) => compareFamilies(type, a, b)).map((family) => {
						const parts = (byFamily.get(family) || []).sort((a, b) => a.name.localeCompare(b.name, "en"));
						return {
							family,
							cells: sumInventoryCells(parts),
							children: parts,
							unused: parts[0]?.unused || /* @__PURE__ */ new Set()
						};
					}).filter((node) => Object.keys(node.cells).length))
				};
			});
			return {
				totalProduced,
				globalEfficiency: totalRate > 0 ? Math.round(totalProduced / totalRate * 100) : 0,
				projectedFinal,
				programmedMinutes: programmedMins,
				unjustifiedCount: unjustifiedLogs.length,
				unjustifiedMins,
				topFailures: Object.entries(failureMap).map(([name, mins]) => ({
					name,
					mins
				})).sort((a, b) => b.mins - a.mins).slice(0, 10),
				criticalMachines: Object.entries(machineFailureMap).map(([name, mins]) => ({
					name,
					mins
				})).sort((a, b) => b.mins - a.mins).slice(0, 8),
				totalRate,
				trend,
				topFamilies: Object.entries(famMap).map(([name, qty]) => ({
					name,
					qty
				})).sort((a, b) => b.qty - a.qty).slice(0, 15),
				stats: Object.values(procMap).filter((p) => filterType() === "ALL" || data.streams[filterType()]?.includes(p.name)).map((p) => ({
					name: p.name,
					efficiency: p.r > 0 ? Math.round(p.p / p.r * 100) : 0,
					unjustified: p.uMins,
					programmed: p.programmed || 0
				})).sort((a, b) => a.efficiency - b.efficiency),
				streamMap,
				volumeTables,
				inventoryTables
			};
		});
		const accentColor = derived(() => {
			return filterHour !== "ALL" || filterShift !== "ALL" || filterFailure !== "ALL" || filterFamily !== "ALL" ? "#0070f3" : filterType() === "CONTROLLER" ? "#1A1A1A" : "#FF4F00";
		});
		function streamGradient(steps) {
			const colors = steps.map((step) => {
				if (!step.hasData) return "#3f3f46";
				return step.efficiency < 85 ? "#dc2626" : "#16a34a";
			});
			if (!colors.length) return "#e4e4e7";
			if (colors.length === 1) return colors[0];
			return `linear-gradient(90deg, ${colors.join(", ")})`;
		}
		const bypassedProcesses = derived(() => {
			if (plantArea() === "FINISH") return new Set(middleBypass(finishRoutes()[filterType()] || [], data.finishBypass?.[filterType()]));
			return new Set(middleBypass(data.streams?.[filterType()] || [], data.inventoryBypass?.[filterType()]));
		});
		function finishReleasedBy(type) {
			const order = data.streams?.[type] || [];
			const families = (data.familyMapping?.[type] || []).filter((name) => name && !isBoardPoolFamily(name));
			const exits = [...new Set(families.map((family) => buildExitProcess(type, family)).filter(Boolean))];
			const fallback = buildExitProcess(type, "");
			if (fallback && !exits.length) exits.push(fallback);
			exits.sort((a, b) => {
				const left = order.indexOf(a);
				const right = order.indexOf(b);
				return (left < 0 ? 99 : left) - (right < 0 ? 99 : right) || a.localeCompare(b, "en");
			});
			if (exits.length <= 1) return exits[0] || "the last build process";
			if (exits.length === 2) return `${exits[0]} or ${exits[1]}`;
			return `${exits.slice(0, -1).join(", ")}, or ${exits[exits.length - 1]}`;
		}
		const bridgeLogs = derived(() => volumeRangeActive() ? [] : data.logs);
		const delivery = derived(() => buildDeliveryBridge(bridgeLogs(), filterType(), finishRoutes(), acceptedLevels()));
		const finishView = derived(() => {
			let streamSource = data.logs.filter((log) => logArea(log) === "FINISH");
			if (filterHour !== "ALL") streamSource = streamSource.filter((log) => timeLabel(log.DISPLAY_ID) === filterHour);
			let kpiLogs = streamSource;
			if (filterType() !== "ALL") kpiLogs = kpiLogs.filter((log) => log.TYPE === filterType());
			kpiLogs = kpiLogs.filter((log) => !failureTransit(log));
			let tableLogs = kpiLogs;
			if (volumeRangeActive()) {
				tableLogs = [].filter((log) => logArea(log) === "FINISH" && !failureTransit(log));
				if (filterType() !== "ALL") tableLogs = tableLogs.filter((log) => log.TYPE === filterType());
			}
			let handoffLogs = bridgeLogs();
			if (!volumeRangeActive()) {
				if (filterHour !== "ALL") handoffLogs = handoffLogs.filter((log) => timeLabel(log.DISPLAY_ID) === filterHour);
			}
			return finishAreaView({
				streamSource,
				kpiLogs,
				tableLogs,
				stream: filterType(),
				familiesByType: data.familyMapping,
				isReadOnly: data.isReadOnly,
				dayBlocks: buildTimeline(!!data.isSpecialDay).length || 1,
				isUnjustified,
				routes: finishRoutes(),
				bridgeLogs: handoffLogs,
				bypass: data.finishBypass?.[filterType()] || [],
				accepted: acceptedLevels()
			});
		});
		const dashboard = derived(() => {
			if (plantArea() !== "FINISH") return activeData();
			return {
				totalProduced: finishView().totalProduced,
				totalRate: finishView().totalRate,
				projectedFinal: finishView().projectedFinal,
				globalEfficiency: finishView().globalEfficiency,
				programmedMinutes: finishView().programmedMinutes,
				unjustifiedCount: finishView().unjustifiedCount,
				unjustifiedMins: finishView().unjustifiedMins,
				trend: finishView().trend,
				topFamilies: finishView().topFamilies,
				stats: finishView().stats,
				streamMap: finishView().streamMap,
				criticalMachines: finishView().criticalMachines,
				topFailures: finishView().topFailures
			};
		});
		const barColor = derived(() => dashboard().unjustifiedCount > 0 ? "#f97316" : accentColor());
		const selectedStream = derived(() => dashboard().streamMap.find((stream) => stream.type === filterType()) ?? null);
		const selectedVolume = derived(() => plantArea() === "FINISH" ? finishView().volume : dashboard().volumeTables.find((table) => table.type === filterType()) ?? null);
		const selectedInventory = derived(() => plantArea() === "FINISH" ? finishView().inventory : dashboard().inventoryTables.find((table) => table.type === filterType()) ?? null);
		function familyOptionNames(rows, names = []) {
			for (const row of rows || []) {
				if (row.kind === "part") continue;
				const name = row.name || row.family;
				if (name) names.push(name);
				if (row.children?.length) familyOptionNames(row.children, names);
			}
			return names;
		}
		function filterRowsByFamily(rows, selected) {
			return rows;
		}
		function filterRowsByLevel(rows, level) {
			return rows;
		}
		function filterRowsByPart(rows, query) {
			const wanted = String("").trim().toUpperCase();
			if (!wanted) return rows;
			const visit = (entries) => {
				const kept = [];
				for (const row of entries) {
					if (row.kind === "part") {
						if (String(row.name || "").toUpperCase().includes(wanted)) kept.push(row);
						continue;
					}
					const children = visit(row.children || []);
					if (!children.length) continue;
					const total = children.reduce((sum, child) => sum + (child.total ?? Object.values(child.cells || {}).reduce((qty, value) => qty + (value || 0), 0)), 0);
					kept.push({
						...row,
						children,
						cells: sumInventoryCells(children),
						total,
						unused: intersectUnused(children)
					});
				}
				return kept;
			};
			return visit(rows);
		}
		const tableFamilyOptions = derived(() => {
			const seen = /* @__PURE__ */ new Set();
			const names = [];
			for (const name of [
				...familyOptionNames(selectedVolume()?.rows),
				...familyOptionNames(selectedInventory()?.rows),
				...(data.productionPlan || []).filter((row) => filterType() === "ALL" || !row.type || row.type === filterType()).map((row) => row.family)
			]) {
				const key = name.toUpperCase();
				if (seen.has(key)) continue;
				seen.add(key);
				names.push(name);
			}
			return names;
		});
		function applyTableFilters(rows) {
			return filterRowsByPart(filterRowsByLevel(filterRowsByFamily(rows)));
		}
		const filteredVolume = derived(() => selectedVolume() ? {
			...selectedVolume(),
			rows: applyTableFilters(selectedVolume().rows)
		} : null);
		const filteredInventory = derived(() => selectedInventory() ? {
			...selectedInventory(),
			rows: applyTableFilters(selectedInventory().rows)
		} : null);
		const trackingTable = derived(() => {
			if (!filterType() || filterType() === "ALL") return null;
			const areaName = plantArea() === "FINISH" ? "finish" : "build";
			const slots = new Set(buildTimeline(!!data.isSpecialDay).map((slot) => slot.time));
			const dayLogs = (data.logs || []).filter((log) => {
				if (!(log.PRODUCED > 0) || failureTransit(log)) return false;
				return slots.has(extractHourMinute(log.DISPLAY_ID));
			});
			const streamLogs = dayLogs.filter((log) => log.TYPE === filterType());
			const chain = filterType() === "RADAR" ? RADAR_PROCESS_CHAIN : [...(data.streams?.[filterType()] || []).map((name) => ({
				key: `build:${name}`,
				label: name,
				process: name,
				servers: name === "SMT" ? ["SPI_S1", "SPI_S2"] : name === "LASER ETCH" ? ["BOARD_LABEL"] : [name.replace(/\s+/g, "")],
				part: name === "LASER ETCH" ? "laser" : name === "SMT" || name === "XRAY" ? "board" : "module",
				area: "build"
			})), ...(finishRoutes()?.[filterType()] || []).map((name) => ({
				key: `finish:${name}`,
				label: name,
				process: name,
				servers: [name.replace(/\s+/g, "")],
				part: "module",
				area: "finish"
			}))];
			const columns = chain.filter((column) => column.area === areaName);
			const produced = (logs, part, column) => {
				if (!part) return 0;
				let total = 0;
				for (const log of logs) {
					if (log.PARTNUMBER !== part) continue;
					const server = log.SERVER_PROCESS || "";
					const process = log.PROCESS || "";
					if (column.servers?.includes(server) || column.servers?.includes(process) || column.process === process) total += log.PRODUCED || 0;
				}
				return total;
			};
			const countedPart = (row, column) => {
				if (column.part === "laser") return row.laserPart;
				if (column.part === "board") return row.smtPart;
				return row.modulePn;
			};
			const familyWanted = tableFamily.toUpperCase();
			const partQuery = tablePart.trim().toUpperCase();
			const source = (data.productionPlan || []).filter((plan) => plan.type === filterType());
			const rows = (areaName === "finish" ? source : groupPlanByModule(source)).map((plan) => {
				const pace = planPace(chain.map((column) => produced(column.area === "finish" ? dayLogs : streamLogs, countedPart(plan, column), column)), plan.planTotal, chain.map((column) => column.label));
				const cells = {};
				chain.forEach((column, index) => {
					if (column.area === areaName) cells[column.key] = pace[index];
				});
				return {
					...plan,
					name: plan.modulePn,
					cells
				};
			}).filter((row) => {
				if (familyWanted !== "ALL") {
					const own = row.family.toUpperCase() === familyWanted;
					const group = filterType() === "RADAR" && radarOrderName(row.family).toUpperCase() === familyWanted;
					if (!own && !group) return false;
				}
				if (partQuery && !`${row.family} ${row.smtPart} ${row.modulePn} ${row.packingPn || ""}`.toUpperCase().includes(partQuery)) return false;
				return true;
			}).sort((a, b) => {
				const family = compareFamilyNames(filterType(), a.family, b.family);
				if (family) return family;
				const left = areaName === "finish" ? a.packingPn || a.modulePn : a.modulePn;
				const right = areaName === "finish" ? b.packingPn || b.modulePn : b.modulePn;
				return String(left).localeCompare(String(right), "en");
			});
			return {
				type: filterType(),
				area: areaName,
				columns,
				rows
			};
		});
		function trackNumber(value, blankZero = true) {
			const number = Number(value);
			if (!Number.isFinite(number) || blankZero && !number) return "";
			return number.toLocaleString("en-US");
		}
		function trackingColumnTotal(rows, column) {
			const seen = /* @__PURE__ */ new Set();
			let total = 0;
			for (const row of rows) {
				const part = column.part === "laser" ? row.laserPart : column.part === "board" ? row.smtPart : row.modulePn;
				if (!part || seen.has(part)) continue;
				seen.add(part);
				total += row.cells[column.key]?.qty || 0;
			}
			return total;
		}
		function formatPlanSaved(value) {
			if (!value) return "";
			return new Date(value).toLocaleString("en-US", {
				timeZone: PLANT_TZ,
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit"
			});
		}
		let scrapeChanges = null;
		function collectParts(rows, into = []) {
			for (const row of rows || []) if (row.kind === "part") into.push(row);
			else collectParts(row.children, into);
			return into;
		}
		function plantWallStamp(date = /* @__PURE__ */ new Date()) {
			const parts = new Intl.DateTimeFormat("en-US", {
				timeZone: PLANT_TZ,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hourCycle: "h23"
			}).formatToParts(date);
			const pick = (type) => Number(parts.find((part) => part.type === type)?.value);
			return Date.UTC(pick("year"), pick("month") - 1, pick("day"), pick("hour"), pick("minute"));
		}
		const holdReference = derived(() => {
			if (!data.isReadOnly) return plantWallStamp();
			let max = 0;
			for (const log of data.logs || []) {
				const stamp = inventoryStamp(log.DISPLAY_ID);
				if (stamp > max) max = stamp;
			}
			return max || plantWallStamp();
		});
		function formatHold(since) {
			if (!since || !holdReference()) return "";
			const mins = Math.max(0, Math.round((holdReference() - since) / 6e4));
			if (mins < 60) return `${mins}m`;
			const hours = Math.floor(mins / 60);
			const rest = mins % 60;
			return rest ? `${hours}h ${rest}m` : `${hours}h`;
		}
		function formatHoldSince(since) {
			if (!since) return "";
			return new Date(since).toLocaleString("en-US", {
				timeZone: "UTC",
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit"
			});
		}
		function gapLoad(row, columns) {
			const parts = collectParts([row]);
			let best = null;
			for (const col of columns || []) {
				let qty = 0;
				let since = null;
				for (const part of parts) {
					const amount = part.cells?.[col.key] || 0;
					if (!amount) continue;
					qty += amount;
					const stamp = part.ages?.[col.key];
					if (stamp && (since == null || stamp < since)) since = stamp;
				}
				if (qty > 0 && (!best || qty > best.qty)) best = {
					key: col.key,
					label: col.label,
					qty,
					since
				};
			}
			return best;
		}
		const bottlenecks = derived(() => {
			const table = filteredInventory();
			if (!table) return [];
			return table.rows.map((row) => {
				const load = gapLoad(row, table.columns);
				return load ? {
					name: row.name || row.family,
					family: row.family || row.name,
					...load
				} : null;
			}).filter(Boolean).sort((a, b) => b.qty - a.qty);
		});
		const story = derived(() => {
			collectParts(selectedVolume()?.rows);
			collectParts(selectedInventory()?.rows);
			return null;
		});
		const captureHref$1 = (processName) => {
			const href = captureHref(processName, null, data.selectedDate);
			if (plantArea() !== "FINISH") return href;
			return `${href}${href.includes("?") ? "&" : "?"}area=finish`;
		};
		let openFamilyGroups = {};
		function collectGroupIds(entries, ids = []) {
			for (const row of entries || []) if (row.kind === "group" && row.children?.length) {
				ids.push(row.id);
				collectGroupIds(row.children, ids);
			}
			return ids;
		}
		function inventoryStamp(displayId) {
			if (!displayId) return 0;
			const date = displayId.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
			const time = displayId.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
			if (!date || !time) return 0;
			let hours = parseInt(time[1], 10);
			const minutes = parseInt(time[2], 10) || 0;
			const ampm = time[3].toUpperCase();
			if (ampm === "PM" && hours !== 12) hours += 12;
			if (ampm === "AM" && hours === 12) hours = 0;
			return Date.UTC(Number(date[3]), Number(date[1]) - 1, Number(date[2]), hours, minutes);
		}
		function excludeFromInventoryTotal(columnKey, type, family) {
			if (columnKey === "LASER ETCH|SMT") return true;
			if (columnKey !== "SPI_S1|SPI_S2") return false;
			if (type === "RADAR") return /^KIA\b/i.test(family || "");
			return true;
		}
		function inventoryHold(upstream, downstream) {
			const deltas = /* @__PURE__ */ new Map();
			for (const [stamp, qty] of upstream || []) deltas.set(stamp, (deltas.get(stamp) || 0) + qty);
			for (const [stamp, qty] of downstream || []) deltas.set(stamp, (deltas.get(stamp) || 0) - qty);
			let balance = 0;
			let since = null;
			for (const stamp of [...deltas.keys()].sort((a, b) => a - b)) {
				const next = balance + deltas.get(stamp);
				if (next <= 0) {
					balance = 0;
					since = null;
				} else {
					if (balance === 0) since = stamp;
					balance = next;
				}
			}
			return {
				qty: balance,
				since
			};
		}
		function mergeEventMaps(maps) {
			const merged = /* @__PURE__ */ new Map();
			for (const map of maps) {
				if (!map) continue;
				for (const [stamp, qty] of map) merged.set(stamp, (merged.get(stamp) || 0) + qty);
			}
			return merged;
		}
		function buildSubtypeLinks(rows) {
			const byServer = /* @__PURE__ */ new Map();
			const add = (map, key, value) => {
				if (!key || !value) return;
				if (!map.has(key)) map.set(key, /* @__PURE__ */ new Set());
				map.get(key).add(value);
			};
			for (const row of rows || []) {
				const server = String(row.SERVER_PARTNUMBER || "").trim();
				const process = String(row.SERVER_PROCESS || "").trim();
				const real = String(row.REAL_PARTNUMBER || "").trim();
				if (!server || !real) continue;
				if (!byServer.has(server)) byServer.set(server, {});
				byServer.get(server)[process] = real;
			}
			const rawToS1 = /* @__PURE__ */ new Map();
			const rawToS2 = /* @__PURE__ */ new Map();
			const s1ToS2 = /* @__PURE__ */ new Map();
			const boardToModulesS1 = /* @__PURE__ */ new Map();
			const boardToModulesS2 = /* @__PURE__ */ new Map();
			for (const [server, procs] of byServer) {
				if (procs.BOARD_LABEL && procs.SPI_S1) add(rawToS1, procs.BOARD_LABEL, procs.SPI_S1);
				if (procs.BOARD_LABEL && procs.SPI_S2) add(rawToS2, procs.BOARD_LABEL, procs.SPI_S2);
				if (procs.SPI_S1 && procs.SPI_S2) add(s1ToS2, procs.SPI_S1, procs.SPI_S2);
				const stored = procs.PROGRAMMING || server;
				if (procs.SPI_S1 && stored !== procs.SPI_S1) add(boardToModulesS1, procs.SPI_S1, stored);
				if (procs.SPI_S2 && stored !== procs.SPI_S2) add(boardToModulesS2, procs.SPI_S2, stored);
			}
			return {
				rawToS1,
				rawToS2,
				s1ToS2,
				boardToModulesS1,
				boardToModulesS2
			};
		}
		function inventoryLevel(level) {
			const name = String(level || "").trim().toUpperCase();
			if (name === "RAWBOARD" || name === "RAW BOARD") return "RAW BOARD";
			if (name === "BOARD") return "BOARD";
			if (name === "MODULE") return "MODULE";
			return "";
		}
		function skipsEdgebond(family) {
			return /^ECU\b/i.test(family) || /^CADM LOW\b/i.test(family);
		}
		function intersectUnused(nodes) {
			if (!nodes?.length) return /* @__PURE__ */ new Set();
			let keys = null;
			for (const node of nodes) {
				const current = node.unused || /* @__PURE__ */ new Set();
				keys = keys ? new Set([...keys].filter((key) => current.has(key))) : new Set(current);
			}
			return keys || /* @__PURE__ */ new Set();
		}
		function unusedVolumeKeys(type, family) {
			const unused = /* @__PURE__ */ new Set();
			if (type === "RADAR" && !/^KIA\b/i.test(family)) unused.add("SPI_S2");
			if (type === "CONTROLLER" && skipsEdgebond(family)) unused.add("EDGEBONDAOI");
			if (type === "IFV300" && /^IFV300 CAMERA\b/i.test(family)) {
				unused.add("ICT");
				unused.add("MOL");
			}
			if (type === "IFV600" && /^IFV600 CAMERA\b/i.test(family)) {
				unused.add("AOI_PTH");
				unused.add("PROGRAMMING");
			}
			if (type === "IFV600" && /^IFV600 MAIN\b/i.test(family)) unused.add("ICT");
			if (type === "GM DMS" && /^GM DMS ECU\b/i.test(family)) {
				unused.add("XRAY");
				unused.add("ICT");
			}
			if (type === "CAMERA" && !/OMNIVISION/i.test(family)) unused.add("UNDERFILLAOI");
			return unused;
		}
		function routeSkipsInventoryColumn(type, family, key) {
			if (key === "SPI_S1|SPI_S2") return type === "RADAR" && !/^KIA\b/i.test(family);
			const [from, to] = String(key).split("|");
			if (type === "CONTROLLER" && skipsEdgebond(family) && (from === "EDGEBOND" || to === "EDGEBOND")) return true;
			if (type === "CONTROLLER" && key === "PROGRAMMING|CONFORMAL" && !skipsEdgebond(family)) return true;
			if (type === "IFV300" && /^IFV300 CAMERA\b/i.test(family) && (from === "ICT" || to === "ICT" || from === "MOL" || to === "MOL")) return true;
			if (type === "IFV600" && /^IFV600 CAMERA\b/i.test(family) && (from === "PTH" || to === "PTH" || from === "PROGRAMMING" || to === "PROGRAMMING")) return true;
			if (type === "IFV600" && /^IFV600 MAIN\b/i.test(family) && (from === "SMT" && to === "XRAY" || from === "ICT" || to === "ICT")) return true;
			if (type === "GM DMS" && /^GM DMS ECU\b/i.test(family) && (from === "XRAY" || to === "XRAY" || from === "ICT" || to === "ICT")) return true;
			if (type === "CAMERA" && !/OMNIVISION/i.test(family) && (from === "UNDERFILL" || to === "UNDERFILL")) return true;
			if (type === "CAMERA" && /OMNIVISION/i.test(family) && from === "SMT" && to === "PTH") return true;
			return false;
		}
		function unusedInventoryKeys(type, family, columns) {
			const unused = /* @__PURE__ */ new Set();
			for (const col of columns) if (routeSkipsInventoryColumn(type, family, col.key)) unused.add(col.key);
			return unused;
		}
		const familyListOrder = {
			CAMERA: [
				"52 DEGREES CAMERA",
				"100 DEGREES CAMERA",
				"100 DEGREES OMNIVISION CAMERA"
			],
			IFV300: ["IFV300 MAIN", "IFV300 CAMERA"],
			IFV600: ["IFV600 MAIN", "IFV600 CAMERA"],
			"GM DMS": ["GM DMS ECU", "GM DMS CAMERA"],
			"VOLVO VIU": ["VOLVO VIU C", "VOLVO VIU F"]
		};
		const radarFamilyOrder = [
			"SRR FORD",
			"MRR FORD",
			"SRR FCA",
			"MRR FCA",
			"KIA",
			"NISSAN",
			"RIVIAN & THUNDER"
		];
		function radarOrderName(family) {
			const name = String(family || "");
			if (/^SRR FORD\b/i.test(name)) return "SRR FORD";
			if (/^MRR FORD\b/i.test(name)) return "MRR FORD";
			if (/^SRR FCA\b/i.test(name)) return "SRR FCA";
			if (/^MRR FCA\b/i.test(name)) return "MRR FCA";
			if (/^KIA\b/i.test(name)) return "KIA";
			if (/^NISSAN\b/i.test(name)) return "NISSAN";
			if (/^(RIVIAN|SRR THUNDER|FLR4 THUNDER)\b/i.test(name) || /RIVIAN & THUNDER/i.test(name)) return "RIVIAN & THUNDER";
			return name;
		}
		function radarFamilyRank(row) {
			const key = row.orderName || radarOrderName(row.name || row.family);
			const index = radarFamilyOrder.indexOf(key);
			return index === -1 ? radarFamilyOrder.length : index;
		}
		function compareFamilies(type, a, b) {
			const order = familyListOrder[type];
			const left = String(a || "");
			const right = String(b || "");
			if (!order) return left.localeCompare(right, "en");
			const rank = (name) => {
				const index = order.findIndex((item) => item.toUpperCase() === name.toUpperCase());
				return index === -1 ? order.length : index;
			};
			return rank(left) - rank(right) || left.localeCompare(right, "en");
		}
		function sharedRawPool(family) {
			if (/^KIA & KIA 2026 BOARD$/i.test(family)) return {
				test: /^KIA\b/i,
				useS2: false
			};
			if (/^NISSAN & NISSAN 2026 BOARD$/i.test(family)) return {
				test: /^NISSAN\b/i,
				useS2: false
			};
			if (/^SRR FCA & SRR FCA DT BOARD$/i.test(family)) return {
				test: /^SRR FCA\b/i,
				useS2: false
			};
			if (/^MRR FCA & MRR FCA JL BUX BOARD$/i.test(family)) return {
				test: /^MRR FCA\b/i,
				useS2: false
			};
			if (/^SRR-FLR4 THUNDER\s*&\s*RIVIAN BOARD$/i.test(family)) return {
				test: /^(RIVIAN|SRR THUNDER|FLR4 THUNDER)\b/i,
				useS2: false
			};
			return null;
		}
		function isSpiS1(serverProcess) {
			return String(serverProcess || "").includes("SPI_S1");
		}
		function isSpiS2(serverProcess) {
			return String(serverProcess || "").includes("SPI_S2");
		}
		function middleBypass(steps, names) {
			return (names || []).filter((name) => {
				const index = steps.indexOf(name);
				return index > 0 && index < steps.length - 1;
			});
		}
		function handoffSpan(from, to) {
			const chain = [
				"XRAY",
				"SINGULATION",
				"ICT",
				"MOL"
			];
			const start = chain.indexOf(from);
			const end = chain.indexOf(to);
			return start >= 0 && end > start;
		}
		function gapLevel(type, from, to) {
			if (from === "LASER ETCH" && to === "SMT") return "RAW BOARD";
			if ((type === "MRR ADAS" || type === "IFV300") && handoffSpan(from, to)) return "HANDOFF";
			if (from === "XRAY" && to === "PROGRAMMING") return "HANDOFF";
			if (type === "MRR ADAS" && (from === "XRAY" && to === "SINGULATION" || from === "SINGULATION" && to === "ICT" || from === "ICT" && to === "MOL")) return "HANDOFF";
			if (type === "IFV300" && (from === "XRAY" && to === "SINGULATION" || from === "SINGULATION" && to === "ICT" || from === "ICT" && to === "MOL")) return "HANDOFF";
			const board = type === "CONTROLLER" ? [
				"SMT",
				"PTH",
				"XRAY"
			] : type === "VOLVO DHU" ? [
				"SMT",
				"PTH",
				"XRAY",
				"ROUTERMILLING",
				"ICT"
			] : type === "MRR ADAS" || type === "IFV300" ? [
				"SMT",
				"XRAY",
				"ICT"
			] : type === "IFV600" ? [
				"SMT",
				"PTH",
				"XRAY",
				"ICT"
			] : type === "GM DMS" ? [
				"SMT",
				"XRAY",
				"ICT"
			] : type === "CAMERA" ? [
				"SMT",
				"UNDERFILL",
				"PTH",
				"ICT"
			] : ["SMT", "XRAY"];
			if (board.includes(from) && board.includes(to)) return "BOARD";
			return "MODULE";
		}
		function sumInventoryCells(nodes) {
			const cells = {};
			for (const node of nodes) for (const [key, qty] of Object.entries(node.cells || {})) cells[key] = (cells[key] || 0) + qty;
			return cells;
		}
		function inventoryFamilyNode(type, node) {
			return {
				kind: "group",
				id: `INV|${type}|FAM|${node.family}`,
				name: node.family,
				family: node.family,
				cells: node.cells,
				unused: node.unused || /* @__PURE__ */ new Set(),
				children: node.children
			};
		}
		function inventoryParent(type, id, name, members) {
			const children = members.map((node) => inventoryFamilyNode(type, node));
			return {
				kind: "group",
				id: `INV|${type}|GROUP|${id}`,
				name,
				cells: sumInventoryCells(children),
				unused: intersectUnused(children.length === 1 ? children[0].children : children),
				children: children.length === 1 ? children[0].children : children
			};
		}
		function groupInventoryRows(type, nodes) {
			if (type !== "CONTROLLER" && type !== "RADAR") return nodes.map((node) => inventoryFamilyNode(type, node)).sort((a, b) => compareFamilies(type, a.name, b.name));
			if (type === "CONTROLLER") {
				const buckets = {
					ECU: [],
					CADM: []
				};
				const plain = [];
				for (const node of nodes) if (/^ECU\b/i.test(node.family)) buckets.ECU.push(node);
				else if (/^CADM\b/i.test(node.family)) buckets.CADM.push(node);
				else plain.push(inventoryFamilyNode(type, node));
				const subgroup = (id, name, members) => {
					if (!members.length) return null;
					return inventoryParent(type, id, name, members);
				};
				const cadmChildren = [
					[
						"CADM|LOW",
						"CADM LOW",
						(node) => /^CADM LOW\b/i.test(node.family)
					],
					[
						"CADM|MID",
						"CADM MID",
						(node) => /^CADM MID\b/i.test(node.family)
					],
					[
						"CADM|MAP",
						"CADM MAP",
						(node) => /^CADM MAP\b/i.test(node.family)
					]
				].map(([id, name, match]) => subgroup(id, name, buckets.CADM.filter(match))).filter(Boolean);
				const ecuChildren = ["2.0", "2.2"].map((version) => subgroup(`ECU|${version}`, version, buckets.ECU.filter((node) => node.family.includes(version)))).filter(Boolean);
				const grouped = [];
				if (ecuChildren.length) grouped.push({
					kind: "group",
					id: "INV|CONTROLLER|GROUP|ECU",
					name: "ECU",
					cells: sumInventoryCells(ecuChildren),
					unused: intersectUnused(ecuChildren),
					children: ecuChildren
				});
				if (cadmChildren.length) grouped.push({
					kind: "group",
					id: "INV|CONTROLLER|GROUP|CADM",
					name: "CADM",
					cells: sumInventoryCells(cadmChildren),
					unused: intersectUnused(cadmChildren),
					children: cadmChildren
				});
				return [...grouped, ...plain];
			}
			const rules = [
				[
					"NISSAN",
					"NISSAN",
					(node) => /^NISSAN\b/i.test(node.family)
				],
				[
					"KIA",
					"KIA",
					(node) => /^KIA\b/i.test(node.family)
				],
				[
					"SRR FCA",
					"SRR FCA",
					(node) => /^SRR FCA\b/i.test(node.family)
				],
				[
					"MRR FCA",
					"MRR FCA",
					(node) => /^MRR FCA\b/i.test(node.family)
				]
			];
			const claimed = /* @__PURE__ */ new Set();
			const grouped = [];
			for (const [id, name, match] of rules) {
				const members = nodes.filter(match);
				members.forEach((node) => claimed.add(node.family));
				const rawMembers = members.filter((node) => sharedRawPool(node.family));
				const familyMembers = members.filter((node) => !sharedRawPool(node.family));
				if (!familyMembers.length && !rawMembers.length) continue;
				const rawParts = rawMembers.flatMap((node) => node.children || []);
				const parent = familyMembers.length ? inventoryParent(type, id, name, familyMembers) : {
					kind: "group",
					id: `INV|${type}|GROUP|${id}`,
					name,
					cells: {},
					children: []
				};
				if (rawParts.length) {
					parent.children = [...rawParts, ...parent.children || []];
					parent.cells = sumInventoryCells(parent.children);
					parent.unused = intersectUnused(parent.children);
				}
				if (parent.children?.length) grouped.push(parent);
			}
			const thunderMembers = nodes.filter((node) => /^RIVIAN\b/i.test(node.family) || /^SRR THUNDER\b/i.test(node.family) || /^FLR4 THUNDER\b/i.test(node.family) || /^SRR-FLR4 THUNDER\s*&\s*RIVIAN BOARD$/i.test(node.family));
			thunderMembers.forEach((node) => claimed.add(node.family));
			if (thunderMembers.length) {
				const named = thunderMembers.map((node) => {
					if (/^SRR-FLR4 THUNDER\s*&\s*RIVIAN BOARD$/i.test(node.family)) return node;
					if (/^RIVIAN\b/i.test(node.family)) return {
						...node,
						label: "RIVIAN"
					};
					if (/^SRR THUNDER\b/i.test(node.family)) return {
						...node,
						label: "SRR THUNDER"
					};
					return {
						...node,
						label: "FLR4 THUNDER"
					};
				});
				const children = [];
				for (const label of [
					"RIVIAN",
					"SRR THUNDER",
					"FLR4 THUNDER"
				]) {
					const members = named.filter((node) => node.label === label);
					if (members.length) children.push(inventoryParent(type, label, label, members));
				}
				const board = named.find((node) => !node.label);
				if (board) {
					const rawParts = sharedRawPool(board.family) ? board.children || [] : null;
					if (rawParts) children.unshift(...rawParts);
					else children.push(inventoryFamilyNode(type, board));
				}
				grouped.push({
					kind: "group",
					id: "INV|RADAR|GROUP|RIVIAN & THUNDER",
					name: "RIVIAN & THUNDER",
					cells: sumInventoryCells(children),
					unused: intersectUnused(children),
					children
				});
			}
			return [...nodes.filter((node) => !claimed.has(node.family)).map((node) => inventoryFamilyNode(type, node)), ...grouped].sort((a, b) => radarFamilyRank(a) - radarFamilyRank(b) || a.name.localeCompare(b.name, "en"));
		}
		function volumeVariantNode(row) {
			return {
				...row,
				id: row.id || row.family,
				name: row.name || row.family,
				kind: row.children?.length ? "group" : "family"
			};
		}
		function groupControllerFamilies(columns, rows) {
			const laserKey = columns.find((col) => col.label === "LASER ETCH")?.key;
			const buckets = {
				ECU: [],
				CADM: []
			};
			const plain = [];
			for (const row of rows) if (/^ECU\b/i.test(row.family)) buckets.ECU.push(row);
			else if (/^CADM\b/i.test(row.family)) buckets.CADM.push(row);
			else plain.push(volumeVariantNode({
				...row,
				id: row.family,
				name: row.family
			}));
			const rollup = (members) => {
				const boards = members.filter((row) => /\bBOARD$/i.test(row.family));
				const variants = members.filter((row) => !/\bBOARD$/i.test(row.family));
				const cells = {};
				for (const row of variants) for (const [key, qty] of Object.entries(row.cells)) cells[key] = (cells[key] || 0) + qty;
				const boardQty = boards.reduce((sum, row) => sum + row.total, 0);
				if (laserKey && boardQty) cells[laserKey] = (cells[laserKey] || 0) + boardQty;
				const total = Object.values(cells).reduce((sum, qty) => sum + qty, 0);
				const variantNodes = variants.map((row) => volumeVariantNode(row));
				const boardParts = boards.flatMap((row) => row.children || []);
				return {
					cells,
					total,
					children: variantNodes.length <= 1 ? [...boardParts, ...variantNodes[0]?.children || []] : [...boardParts, ...variantNodes],
					unused: intersectUnused(variantNodes)
				};
			};
			const subgroup = (id, name, members) => {
				const rolled = rollup(members);
				if (!rolled.children.length) return {
					kind: "family",
					id,
					name,
					cells: rolled.cells,
					total: rolled.total,
					unused: rolled.unused
				};
				return {
					kind: "group",
					id,
					name,
					...rolled
				};
			};
			const cadmChildren = [
				[
					"CADM|LOW",
					"CADM LOW",
					(row) => /^CADM LOW\b/i.test(row.family)
				],
				[
					"CADM|MID",
					"CADM MID",
					(row) => /^CADM MID\b/i.test(row.family)
				],
				[
					"CADM|MAP",
					"CADM MAP",
					(row) => /^CADM MAP\b/i.test(row.family)
				]
			].map(([id, name, match]) => subgroup(id, name, buckets.CADM.filter(match))).filter((group) => group.total > 0 || (group.children?.length ?? 0) > 0);
			const ecuChildren = ["2.0", "2.2"].map((version) => subgroup(`ECU|${version}`, version, buckets.ECU.filter((row) => row.family.includes(version)))).filter((group) => group.total > 0 || (group.children?.length ?? 0) > 0);
			const parent = (id, name, children) => {
				const cells = {};
				for (const child of children) for (const [key, qty] of Object.entries(child.cells)) cells[key] = (cells[key] || 0) + qty;
				return {
					kind: "group",
					id,
					name,
					cells,
					total: Object.values(cells).reduce((sum, qty) => sum + qty, 0),
					children,
					unused: intersectUnused(children)
				};
			};
			const grouped = [];
			if (ecuChildren.length) grouped.push(parent("ECU", "ECU", ecuChildren));
			if (cadmChildren.length) grouped.push(parent("CADM", "CADM", cadmChildren));
			return [...grouped, ...plain];
		}
		function groupRadarFamilies(columns, rows) {
			const laserKey = columns.find((col) => col.label === "LASER ETCH")?.key;
			const rules = [
				[
					"NISSAN",
					"NISSAN",
					(row) => /^NISSAN\b/i.test(row.family)
				],
				[
					"KIA",
					"KIA",
					(row) => /^KIA\b/i.test(row.family)
				],
				[
					"SRR FCA",
					"SRR FCA",
					(row) => /^SRR FCA\b/i.test(row.family)
				],
				[
					"MRR FCA",
					"MRR FCA",
					(row) => /^MRR FCA\b/i.test(row.family)
				]
			];
			const claimed = /* @__PURE__ */ new Set();
			const grouped = [];
			for (const [id, name, match] of rules) {
				const members = rows.filter((row) => match(row));
				members.forEach((row) => claimed.add(row.family));
				if (!members.length) continue;
				const boards = members.filter((row) => /\bBOARD$/i.test(row.family));
				const variants = members.filter((row) => !/\bBOARD$/i.test(row.family));
				const cells = {};
				for (const row of variants) for (const [key, qty] of Object.entries(row.cells)) cells[key] = (cells[key] || 0) + qty;
				const boardQty = boards.reduce((sum, row) => sum + row.total, 0);
				if (laserKey && boardQty) cells[laserKey] = (cells[laserKey] || 0) + boardQty;
				const total = Object.values(cells).reduce((sum, qty) => sum + qty, 0);
				const variantNodes = variants.map((row) => volumeVariantNode(row));
				const boardParts = boards.flatMap((row) => row.children || []);
				const parts = variantNodes.length <= 1 ? [...boardParts, ...variantNodes[0]?.children || []] : [];
				const unused = intersectUnused(variantNodes);
				const only = variantNodes.length === 1 ? variantNodes[0] : null;
				grouped.push(variantNodes.length <= 1 ? {
					kind: parts.length ? "group" : "family",
					id: only?.id || id,
					name: only?.family || only?.name || name,
					family: only?.family || name,
					orderName: name,
					cells,
					total,
					unused,
					children: parts
				} : {
					kind: "group",
					id,
					name,
					orderName: name,
					cells,
					total,
					children: [...boardParts, ...variantNodes],
					unused
				});
			}
			const thunderRules = [
				[
					"RIVIAN",
					"RIVIAN",
					(row) => /^RIVIAN\b/i.test(row.family)
				],
				[
					"SRR THUNDER",
					"SRR THUNDER",
					(row) => /^SRR THUNDER\b/i.test(row.family)
				],
				[
					"FLR4 THUNDER",
					"FLR4 THUNDER",
					(row) => /^FLR4 THUNDER\b/i.test(row.family)
				]
			];
			const thunderChildren = [];
			for (const [id, name, match] of thunderRules) {
				const members = rows.filter((row) => match(row));
				members.forEach((row) => claimed.add(row.family));
				if (!members.length) continue;
				const boards = members.filter((row) => /\bBOARD$/i.test(row.family));
				const variants = members.filter((row) => !/\bBOARD$/i.test(row.family));
				const cells = {};
				for (const row of variants) for (const [key, qty] of Object.entries(row.cells)) cells[key] = (cells[key] || 0) + qty;
				const boardQty = boards.reduce((sum, row) => sum + row.total, 0);
				if (laserKey && boardQty) cells[laserKey] = (cells[laserKey] || 0) + boardQty;
				const total = Object.values(cells).reduce((sum, qty) => sum + qty, 0);
				const variantNodes = variants.map((row) => volumeVariantNode(row));
				const boardParts = boards.flatMap((row) => row.children || []);
				const parts = variantNodes.length <= 1 ? [...boardParts, ...variantNodes[0]?.children || []] : [];
				const only = variantNodes.length === 1 ? variantNodes[0] : null;
				thunderChildren.push(variantNodes.length <= 1 ? {
					kind: parts.length ? "group" : "family",
					id: only?.id || id,
					name: only?.family || only?.name || name,
					family: only?.family || name,
					cells,
					total,
					unused: intersectUnused(variantNodes),
					children: parts
				} : {
					kind: "group",
					id,
					name,
					cells,
					total,
					unused: intersectUnused(variantNodes),
					children: [...boardParts, ...variantNodes]
				});
			}
			const sharedBoards = rows.filter((row) => /^SRR-FLR4 THUNDER\s*&\s*RIVIAN BOARD$/i.test(row.family));
			sharedBoards.forEach((row) => claimed.add(row.family));
			const sharedBoardQty = sharedBoards.reduce((sum, row) => sum + row.total, 0);
			const sharedBoardParts = sharedBoards.flatMap((row) => row.children || []);
			if (thunderChildren.length || sharedBoardQty) {
				const cells = {};
				for (const child of thunderChildren) for (const [key, qty] of Object.entries(child.cells)) cells[key] = (cells[key] || 0) + qty;
				if (laserKey && sharedBoardQty) cells[laserKey] = (cells[laserKey] || 0) + sharedBoardQty;
				const total = Object.values(cells).reduce((sum, qty) => sum + qty, 0);
				grouped.push({
					kind: "group",
					id: "RIVIAN & THUNDER",
					name: "RIVIAN & THUNDER",
					orderName: "RIVIAN & THUNDER",
					cells,
					total,
					children: [...sharedBoardParts, ...thunderChildren],
					unused: intersectUnused(thunderChildren)
				});
			}
			return [...rows.filter((row) => !claimed.has(row.family)).map((row) => volumeVariantNode({
				...row,
				id: row.family,
				name: row.family,
				orderName: radarOrderName(row.family)
			})), ...grouped].sort((a, b) => radarFamilyRank(a) - radarFamilyRank(b) || (a.name || a.family).localeCompare(b.name || b.family, "en"));
		}
		function productionTracking($$renderer) {
			if (trackingTable()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="overflow-x-auto border bg-white p-5 shadow-sm"><div class="mb-4 flex flex-wrap items-end justify-between gap-4"><div><h3 class="border-l-2 border-[#FF4F00] pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">${escape_html(trackingTable().type)} ${escape_html(trackingTable().area === "finish" ? "finish" : "build")} tracking</h3> <p class="mt-2 max-w-2xl text-[9px] font-bold text-gray-400 uppercase">One plan for ${escape_html(data.selectedDate)}.
							${escape_html(trackingTable().area === "finish" ? "One row per packing part number. Counts are the module." : "Grouped by module. The SMT part is what Build counts.")}
							Green means that process met the plan, or a later one already did. `);
				if (formatPlanSaved(data.planUpdatedAt)) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`Plan saved ${escape_html(formatPlanSaved(data.planUpdatedAt))}.`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></p> `);
				if (volumeRangeActive()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="mt-1 text-[9px] font-black text-[#FF4F00] uppercase">Tracking stays on ${escape_html(data.selectedDate)}. The from/to range applies to volume and inventory.</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="flex flex-wrap items-end gap-3">`);
				if (isAdmin()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<form class="flex flex-wrap items-end gap-2"><label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Production plan CSV <input type="file" name="csv-file" accept=".csv,text/csv" required="" title="Columns: PACKING PARTNUMBER, MODULE, PLAN MODULE, PLAN BRACKET." class="max-w-56 border-2 border-black bg-white px-2 py-1 text-[10px] font-bold text-zinc-900 file:mr-2 file:border-0 file:bg-black file:px-2 file:py-0.5 file:text-[9px] file:font-black file:text-white file:uppercase"/></label> <button type="submit"${attr("disabled", planUploading, true)} class="cursor-pointer bg-[#FF4F00] px-4 py-2 text-[10px] font-black text-white uppercase disabled:opacity-40">${escape_html("Upload plan")}</button></form>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <button type="button"${attr("disabled", !trackingTable().rows.length, true)} class="cursor-pointer bg-green-700 px-4 py-2 text-[10px] font-black text-white uppercase disabled:opacity-40">Export CSV</button></div></div> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <table class="volume-ledger w-full min-w-[1100px] border-collapse text-left svelte-1uha8ag"><thead><tr class="bg-[#1A1A1A] text-[8px] font-black tracking-wider text-white uppercase"><th class="sticky left-0 bg-[#1A1A1A] px-2 py-2 text-left text-[#FF4F00]">Family</th><th class="px-1 py-2 text-center">${escape_html(trackingTable().area === "finish" ? "Packing" : "SMT part")}</th><th class="px-1 py-2 text-center">Module</th><th class="px-1 py-2 text-center">Plan module</th><th class="px-1 py-2 text-center">Plan bracket</th><th class="px-1 py-2 text-center text-[#FF4F00]">Plan</th><!--[-->`);
				const each_array = ensure_array_like(trackingTable().columns);
				for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
					let column = each_array[$$index_2];
					$$renderer.push(`<th class="px-1 py-2 text-center">${escape_html(column.label)}</th>`);
				}
				$$renderer.push(`<!--]--></tr></thead><tbody class="svelte-1uha8ag">`);
				if (trackingTable().rows.length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<!--[-->`);
					const each_array_1 = ensure_array_like(trackingTable().rows);
					for (let $$index_4 = 0, $$length = each_array_1.length; $$index_4 < $$length; $$index_4++) {
						let row = each_array_1[$$index_4];
						$$renderer.push(`<tr class="border-b border-zinc-100 text-[10px] svelte-1uha8ag"><td class="sticky left-0 py-2 pr-3 font-black uppercase svelte-1uha8ag">${escape_html(row.family)}</td><td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(trackingTable().area === "finish" ? row.packingPn : row.smtPart)}</td><td class="px-1 py-2 text-center font-mono"><button type="button" class="underline decoration-zinc-300 underline-offset-2">${escape_html(row.modulePn)}</button></td><td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(trackNumber(row.planModule))}</td><td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(trackNumber(row.planBracket))}</td><td class="px-1 py-2 text-center font-mono font-black tabular-nums">${escape_html(trackNumber(row.planTotal, false))}</td><!--[-->`);
						const each_array_2 = ensure_array_like(trackingTable().columns);
						for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
							let column = each_array_2[$$index_3];
							const pace = row.cells[column.key];
							$$renderer.push(`<td class="px-1 py-2 text-center font-mono tabular-nums"${attr("title", pace?.title)}${attr_style("", {
								background: pace?.heat.background,
								color: pace?.heat.color
							})}>${escape_html(trackNumber(pace?.qty, false))}</td>`);
						}
						$$renderer.push(`<!--]--></tr>`);
					}
					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<tr class="svelte-1uha8ag"><td${attr("colspan", trackingTable().columns.length + 6)} class="py-6 text-center text-[10px] font-black tracking-widest text-gray-400 uppercase">No production plan for this day.${escape_html(isAdmin() ? " Upload a CSV with PACKING PARTNUMBER, MODULE, PLAN MODULE and PLAN BRACKET." : "")}</td></tr>`);
				}
				$$renderer.push(`<!--]--></tbody>`);
				if (trackingTable().rows.length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<tfoot class="svelte-1uha8ag"><tr class="border-t-2 border-black text-[10px] font-black svelte-1uha8ag"><td class="sticky left-0 py-2 pr-3 uppercase svelte-1uha8ag">Total</td><td></td><td></td><td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(trackNumber(trackingTable().rows.reduce((sum, row) => sum + (row.planModule || 0), 0)))}</td><td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(trackNumber(trackingTable().rows.reduce((sum, row) => sum + (row.planBracket || 0), 0)))}</td><td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(trackNumber(trackingTable().rows.reduce((sum, row) => sum + (row.planTotal || 0), 0), false))}</td><!--[-->`);
					const each_array_3 = ensure_array_like(trackingTable().columns);
					for (let $$index_5 = 0, $$length = each_array_3.length; $$index_5 < $$length; $$index_5++) {
						let column = each_array_3[$$index_5];
						$$renderer.push(`<td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(trackNumber(trackingColumnTotal(trackingTable().rows, column), false))}</td>`);
					}
					$$renderer.push(`<!--]--></tr></tfoot>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></table></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mx-auto max-w-[1600px] space-y-6 bg-[#FBFBFB] p-6"><header class="space-y-4 border-b-2 border-black pb-4"><div class="flex flex-wrap items-end justify-between gap-4"><div class="flex min-w-0 items-center gap-4"><div${attr_class(`h-14 w-2 shrink-0 ${stringify(dashboard().unjustifiedCount > 0 ? "animate-pulse" : "")}`)}${attr_style("", { "background-color": barColor() })}></div> <div class="min-w-0"><h1 class="text-3xl leading-none font-black tracking-tighter uppercase md:text-4xl">${escape_html(breadcrumb())}</h1> <div class="mt-2 flex flex-wrap items-center gap-3"><span class="flex items-center gap-1 text-[8px] font-bold tracking-widest text-gray-400 uppercase"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span> Last scrape: ${escape_html(data.lastSync || "no record")}</span> `);
			if (data.isReadOnly) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-black text-gray-500 uppercase">Historical mode</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (data.isSpecialDay) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="rounded bg-orange-50 px-2 py-0.5 text-[9px] font-black text-[#FF4F00] uppercase">Special schedule</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div></div></div> <div class="flex flex-wrap items-center justify-end gap-4"><button class="flex items-center gap-2 bg-[#B80000] px-4 py-2 text-[10px] font-black text-white uppercase shadow-sm transition-all hover:bg-red-700">Export Report</button> <input type="date"${attr("value", data.selectedDate)} class="border-2 border-black px-2 py-1 text-[10px] font-black outline-none"/> <div class="flex gap-1"><!--[-->`);
			const each_array_4 = ensure_array_like([
				"ALL",
				"T09",
				"T25",
				"T08"
			]);
			for (let $$index = 0, $$length = each_array_4.length; $$index < $$length; $$index++) {
				let shift = each_array_4[$$index];
				$$renderer.push(`<button${attr_class(`border-2 px-3 py-1 text-[9px] font-black transition-all ${stringify(filterShift === shift ? "border-black bg-black text-white" : "border-gray-100 bg-white text-gray-400 hover:border-[#FF4F00]")}`)}>${escape_html(shift)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <button${attr_class(`w-16 border px-3 py-1 text-[10px] font-black uppercase ${stringify(hasActiveFilters() ? "border-gray-300 bg-gray-100" : "pointer-events-none border-transparent text-transparent")}`)}>Reset</button> <div class="min-w-[200px] border-l pl-6 text-right"><span class="font-mono text-3xl font-black">${escape_html(dashboard().totalProduced.toLocaleString("en-US"))}</span> `);
			if (!data.isReadOnly) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="text-[10px] font-black text-gray-400 uppercase">Est. Final: <span class="text-[#FF4F00] italic">${escape_html(dashboard().projectedFinal.toLocaleString("en-US"))} PCS</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div></header> `);
			if (plantArea() === "FINISH") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<section class="border-2 border-black bg-zinc-950 px-5 py-4 text-white"><div class="flex flex-wrap items-end justify-between gap-4"><div><p class="text-[10px] font-black tracking-widest text-[#FF4F00] uppercase">Available for final test</p> <p class="mt-1 max-w-xl text-[10px] font-bold text-zinc-400 uppercase">Inventory that already left Build and is waiting to enter final test. Totals by family. Part numbers are the first column of the inventory table.</p></div> <div class="text-right"><span class="font-mono text-3xl font-black tabular-nums">${escape_html(delivery().qty.toLocaleString("en-US"))}</span> `);
				if (delivery().since) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="mt-1 block text-[9px] font-black text-[#FF4F00]"${attr("title", `Sitting since ${stringify(formatHoldSince(delivery().since))}`)}>${escape_html(formatHold(delivery().since))}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div> `);
				if (delivery().rows.length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="mt-4 flex gap-2 overflow-x-auto pb-1"><!--[-->`);
					const each_array_5 = ensure_array_like(delivery().rows);
					for (let $$index_1 = 0, $$length = each_array_5.length; $$index_1 < $$length; $$index_1++) {
						let row = each_array_5[$$index_1];
						$$renderer.push(`<button type="button"${attr_class(`shrink-0 border border-zinc-700 bg-zinc-900 px-3 py-2 text-left ${stringify(tableFamily === row.name ? "border-[#FF4F00]" : "")}`)}><span class="block text-[10px] font-black uppercase">${escape_html(row.name)}</span> <span class="font-mono text-sm font-black tabular-nums">${escape_html(row.qty.toLocaleString("en-US"))}</span> `);
						if (row.level && row.level !== "MODULE") {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="ml-1 text-[8px] font-black text-zinc-400">${escape_html(row.level)}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (row.since) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="mt-0.5 block text-[8px] font-black text-[#FF4F00]"${attr("title", `Sitting since ${stringify(formatHoldSince(row.since))}`)}>${escape_html(formatHold(row.since))}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></button>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<p class="mt-3 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Nothing is available for final test in this window</p>`);
				}
				$$renderer.push(`<!--]--> `);
				if (!delivery().finishMeasured) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="mt-3 text-[9px] font-bold text-zinc-500 uppercase">Final test has not taken any pieces yet, so this is everything Build already finished.</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></section>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (data.logs.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center"><p class="text-sm font-black tracking-widest text-gray-500 uppercase">No production recorded for this operating day</p> <p class="mt-2 text-[10px] font-bold text-gray-400 uppercase">Pick another date to review a day with data</p></div> `);
				if (filterType() !== "ALL") {
					$$renderer.push("<!--[0-->");
					productionTracking($$renderer);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push("<!--[-1-->");
				function levelMark($$renderer, level) {
					if (level) {
						$$renderer.push("<!--[0-->");
						const tone = level === "RAW BOARD" ? "bg-zinc-900" : level === "BOARD" ? "bg-[#FF4F00]" : level === "TESTED" ? "bg-emerald-700" : level === "PACKED" ? "bg-violet-800" : "bg-sky-700";
						$$renderer.push(`<button type="button"${attr("title", `Show ${stringify(level.toLowerCase())}`)}${attr_class(`shrink-0 cursor-pointer px-1 py-px text-[7px] font-black tracking-wider text-white ${stringify(tone)} ${stringify(tableLevel === level ? "ring-2 ring-black ring-offset-1" : "")}`)}>${escape_html(level === "RAW BOARD" ? "RAW" : level)}</button>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				}
				function levelLegend($$renderer) {
					const levels = plantArea() === "FINISH" ? FINISH_LEVELS : BUILD_LEVELS;
					$$renderer.push(`<span class="inline-flex items-center gap-1.5 text-[7px] font-black tracking-wider uppercase"><!--[-->`);
					const each_array_6 = ensure_array_like(levels);
					for (let $$index_19 = 0, $$length = each_array_6.length; $$index_19 < $$length; $$index_19++) {
						let level = each_array_6[$$index_19];
						const tone = level === "RAW BOARD" ? "bg-zinc-900" : level === "BOARD" ? "bg-[#FF4F00]" : level === "TESTED" ? "bg-emerald-700" : level === "PACKED" ? "bg-violet-800" : "bg-sky-700";
						$$renderer.push(`<button type="button"${attr_class(`cursor-pointer px-1.5 py-0.5 text-white ${stringify(tone)} ${stringify(tableLevel === level ? "ring-2 ring-black ring-offset-1" : "" )}`)}>${escape_html(level)}</button>`);
					}
					$$renderer.push(`<!--]--></span>`);
				}
				function volumeRows($$renderer, entries, columns, depth, withRowTotal = false, inventoryType = "", showZeros = false) {
					$$renderer.push(`<!--[-->`);
					const each_array_7 = ensure_array_like(entries);
					for (let $$index_21 = 0, $$length = each_array_7.length; $$index_21 < $$length; $$index_21++) {
						let row = each_array_7[$$index_21];
						const rowTotal = columns.reduce((sum, col) => sum + (withRowTotal && excludeFromInventoryTotal(col.key, inventoryType, row.family || row.name) ? 0 : row.cells[col.key] || 0), 0);
						$$renderer.push(`<tr class="border-b border-zinc-100 text-[10px] svelte-1uha8ag"><td${attr_class(`sticky left-0 py-2 pr-3 uppercase ${stringify(depth ? "font-bold" : "font-black")}`, "svelte-1uha8ag")}${attr_style("", { "padding-left": `${stringify(depth * 1.25)}rem` })}><span class="inline-flex max-w-full items-center gap-1.5">`);
						if (row.children?.length && row.kind !== "part") {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<button class="inline-flex items-center gap-2"><span class="text-[8px]">${escape_html(openFamilyGroups[row.id] || tableFamily !== "ALL" || tableLevel !== "ALL" || tablePart.trim() ? "▼" : "▶")}</span> ${escape_html(row.name || row.family)}</button>`);
						} else if (row.kind === "part") {
							$$renderer.push("<!--[1-->");
							$$renderer.push(`<button type="button" class="text-left underline decoration-zinc-300 underline-offset-2">${escape_html(row.name)}</button>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`${escape_html(row.name || row.family)}`);
						}
						$$renderer.push(`<!--]--> `);
						if (row.kind === "part") {
							$$renderer.push("<!--[0-->");
							levelMark($$renderer, row.level);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></span></td><!--[-->`);
						const each_array_8 = ensure_array_like(columns);
						for (let $$index_20 = 0, $$length = each_array_8.length; $$index_20 < $$length; $$index_20++) {
							let col = each_array_8[$$index_20];
							if (row.unused?.has(col.key) && !row.cells[col.key]) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<td class="unused-process px-1 py-2 text-center font-mono text-zinc-400 line-through svelte-1uha8ag" title="Not used by this family">—</td>`);
							} else {
								$$renderer.push("<!--[-1-->");
								const delta = withRowTotal ? scrapeChanges?.marks?.[`${row.family}|${row.name}|${col.key}`] : "";
								$$renderer.push(`<td${attr_class(`px-1 py-2 text-center font-mono tabular-nums ${stringify(delta === "up" ? "text-green-700" : delta === "down" ? "text-red-600" : "")}`)}${attr("title", row.ages?.[col.key] ? `Sitting since ${formatHoldSince(row.ages[col.key])}` : void 0)}>`);
								if (row.cells[col.key] || showZeros) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<span class="block">${escape_html((row.cells[col.key] || 0).toLocaleString("en-US"))}${escape_html(delta === "up" ? " ↑" : delta === "down" ? " ↓" : "")}</span> `);
									if (withRowTotal && row.ages?.[col.key]) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<span class="block text-[8px] font-bold text-[#FF4F00]">${escape_html(formatHold(row.ages[col.key]))}</span>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]-->`);
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--></td>`);
							}
							$$renderer.push(`<!--]-->`);
						}
						$$renderer.push(`<!--]-->`);
						if (withRowTotal) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<td class="px-1 py-2 text-center font-mono font-black tabular-nums"${attr("title", withRowTotal ? "Does not include Laser. SMT (1) is excluded until SMT (2), except radar families other than KIA." : void 0)}>${escape_html(rowTotal || showZeros ? (rowTotal || 0).toLocaleString("en-US") : "")}</td>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></tr> `);
						if (row.children?.length && row.kind !== "part" && (openFamilyGroups[row.id] || tableFamily !== "ALL" || tableLevel !== "ALL" || tablePart.trim())) {
							$$renderer.push("<!--[0-->");
							volumeRows($$renderer, row.children, columns, depth + 1, withRowTotal, inventoryType, showZeros);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<div class="grid grid-cols-3 gap-2 md:grid-cols-9"><!--[-->`);
				const each_array_9 = ensure_array_like(dashboard().streamMap);
				for (let $$index_6 = 0, $$length = each_array_9.length; $$index_6 < $$length; $$index_6++) {
					let stream = each_array_9[$$index_6];
					$$renderer.push(`<button${attr("title", stream.steps.map((step) => `${step.name} ${step.hasData ? `${step.efficiency}%` : "—"}`).join(" · "))}${attr_class(`flex min-w-0 flex-col overflow-hidden border-2 text-left transition-all ${stringify(filterType() === stream.type ? "border-black bg-zinc-50" : "border-gray-200 bg-white hover:border-[#FF4F00]")}`)}><span class="truncate px-2 pt-2 text-[10px] font-black tracking-widest text-zinc-900 uppercase">${escape_html(stream.type)}</span> <span${attr_class(`px-2 font-mono text-sm font-black text-zinc-900 tabular-nums ${stringify(plantArea() === "FINISH" ? "" : "pb-2")}`)}>${escape_html(stream.produced.toLocaleString("en-US"))}</span> `);
					if (plantArea() === "FINISH") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="px-2 pb-1 text-[7px] font-black tracking-widest text-gray-400 uppercase">Finish pcs</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <span class="h-2 w-full"${attr_style("", { background: streamGradient(stream.steps) })}></span></button>`);
				}
				$$renderer.push(`<!--]--></div> `);
				if (selectedStream()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="border-2 border-black bg-white p-5"><div class="mb-4 flex items-center justify-between gap-4"><h2 class="text-[11px] font-black tracking-widest uppercase">${escape_html(selectedStream().type)}
						${escape_html(plantArea() === "FINISH" ? "Finish" : "Value Stream")}</h2> <span class="text-[9px] font-bold text-gray-400 uppercase">${escape_html(data.familyMapping[selectedStream().type]?.length || 0)} Families</span></div> `);
					if (plantArea() === "FINISH" && !selectedStream().steps.length) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="text-[11px] font-black tracking-widest text-gray-400 uppercase">Finish route for ${escape_html(selectedStream().type)} is not defined yet.</p>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="flex w-full items-stretch gap-1"><!--[-->`);
						const each_array_10 = ensure_array_like(selectedStream().steps);
						for (let i = 0, $$length = each_array_10.length; i < $$length; i++) {
							let step = each_array_10[i];
							const canBypass = isAdmin() && i > 0 && i < selectedStream().steps.length - 1;
							const bypassed = bypassedProcesses().has(step.name);
							$$renderer.push(`<div class="group relative min-w-0 flex-1"><button type="button"${attr_class(`relative w-full border px-1 py-2 text-center transition-all ${stringify(bypassed && canBypass ? "pb-4" : "")} ${stringify(filterProcess === step.name ? "border-[#0070f3] bg-blue-50 outline outline-2 outline-[#0070f3]" : !step.hasData ? "border-[#333] bg-[#2a2a2a] text-gray-500" : step.efficiency < 85 ? "border-red-700 bg-red-500 text-white" : "border-green-800 bg-green-600 text-white")}`)}><span${attr_class(`block truncate text-[9px] font-black uppercase ${stringify(bypassed ? "line-through" : "")}`)}>${escape_html(step.name)}</span> <span class="text-[11px] font-black">${escape_html(step.efficiency)}%</span> `);
							if (step.hasPending) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<span class="absolute top-0 right-0 h-2 w-2 animate-pulse rounded-bl-sm bg-orange-400"></span>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--></button> `);
							if (canBypass) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<button type="button"${attr("title", bypassed ? "Inventory is skipping this process" : "Bypass this process in inventory")}${attr_class(`absolute inset-x-1 bottom-0.5 bg-black/80 px-1 py-px text-[7px] font-black tracking-widest text-white uppercase ${stringify(bypassed ? "" : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100")}`)}>${escape_html(bypassed ? "Bypass on" : "Bypass")}</button>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--></div> `);
							if (i < selectedStream().steps.length - 1) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<span class="shrink-0 self-center px-0.5 text-[10px] font-black text-gray-300">›</span>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]-->`);
						}
						$$renderer.push(`<!--]--></div>`);
					}
					$$renderer.push(`<!--]--> `);
					if (bypassedProcesses().size) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="mt-3 text-[9px] font-black tracking-widest text-zinc-500 uppercase">Inventory bypasses ${escape_html([...bypassedProcesses()].join(", "))}. Volume is unchanged.</p>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (plantArea() === "FINISH" && selectedStream().steps.length) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="mt-3 text-[9px] font-black tracking-widest text-zinc-500 uppercase">Final test starts on the board released by ${escape_html(finishReleasedBy(selectedStream().type))}.</p>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div> <div class="space-y-6">`);
					if (plantArea() === "FINISH" && finishView().unconfigured && tableView !== "tracking") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="border bg-white px-5 py-6"><div class="mb-4 flex gap-1"><button${attr_class(`border-2 px-4 py-2 text-[10px] font-black uppercase ${stringify("border-black bg-black text-white" )}`)}>Volume</button> <button${attr_class(`border-2 px-4 py-2 text-[10px] font-black uppercase ${stringify("border-gray-200 bg-white text-gray-400")}`)}>Inventory</button> <button class="border-2 px-4 py-2 text-[10px] font-black uppercase border-gray-200 bg-white text-gray-400">Tracking</button></div> <p class="text-center text-[11px] font-black tracking-widest text-gray-400 uppercase">Finish route for ${escape_html(selectedStream().type)} is not defined yet. Tracking still uses the shared plan.</p></div>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="flex flex-wrap items-end justify-between gap-4 border bg-white px-5 py-4 shadow-sm"><div><div class="flex gap-1"><button${attr_class(`border-2 px-4 py-2 text-[10px] font-black uppercase ${stringify("border-black bg-black text-white" )}`)}>Volume</button> <button${attr_class(`border-2 px-4 py-2 text-[10px] font-black uppercase ${stringify("border-gray-200 bg-white text-gray-400")}`)}>Inventory</button> <button${attr_class(`border-2 px-4 py-2 text-[10px] font-black uppercase ${stringify("border-gray-200 bg-white text-gray-400")}`)}>Tracking</button></div> <span class="mt-2 block text-[9px] font-bold text-gray-400 uppercase">`);
						if (volumeRangeActive()) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`Summed from ${escape_html(volumeFrom)} to ${escape_html(volumeTo)}`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`Showing ${escape_html(data.selectedDate)}`);
						}
						$$renderer.push(`<!--]--></span> `);
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap items-end gap-3"><label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Family `);
						$$renderer.select({
							value: tableFamily,
							class: "w-52 border-2 border-black bg-white px-2 py-1 text-[10px] font-black text-zinc-900 uppercase outline-none"
						}, ($$renderer) => {
							$$renderer.option({ value: "ALL" }, ($$renderer) => {
								$$renderer.push(`All`);
							});
							$$renderer.push(`<!--[-->`);
							const each_array_11 = ensure_array_like(tableFamilyOptions());
							for (let $$index_8 = 0, $$length = each_array_11.length; $$index_8 < $$length; $$index_8++) {
								let name = each_array_11[$$index_8];
								$$renderer.option({ value: name }, ($$renderer) => {
									$$renderer.push(`${escape_html(name)}`);
								});
							}
							$$renderer.push(`<!--]-->`);
						});
						$$renderer.push(`</label> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Part number <input type="search"${attr("value", tablePart)} placeholder="Search" class="w-36 border-2 border-black bg-white px-2 py-1 text-[10px] font-black text-zinc-900 uppercase outline-none placeholder:font-bold placeholder:text-gray-400"/></label> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">From <input type="date"${attr("value", volumeFrom)} class="border-2 border-black px-2 py-1 text-[10px] font-black text-zinc-900 outline-none"/></label> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">To <input type="date"${attr("value", volumeTo)} class="border-2 border-black px-2 py-1 text-[10px] font-black text-zinc-900 outline-none"/></label></div></div> `);
						if (bottlenecks().length) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="border bg-white px-5 py-4 shadow-sm"><h3 class="mb-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Where material is sitting</h3> <div class="flex flex-wrap gap-2"><!--[-->`);
							const each_array_12 = ensure_array_like(bottlenecks());
							for (let $$index_9 = 0, $$length = each_array_12.length; $$index_9 < $$length; $$index_9++) {
								let item = each_array_12[$$index_9];
								$$renderer.push(`<button type="button" class="border border-zinc-200 bg-zinc-50 px-3 py-2 text-left"><span class="block text-[10px] font-black uppercase">${escape_html(item.name)}</span> <span class="block text-[9px] font-bold text-gray-500 uppercase">${escape_html(item.label)}</span> <span class="font-mono text-sm font-black tabular-nums">${escape_html(item.qty.toLocaleString("en-US"))}</span> `);
								if (item.since) {
									$$renderer.push("<!--[0-->");
									$$renderer.push(`<span class="ml-2 text-[9px] font-black text-[#FF4F00]"${attr("title", `Sitting since ${stringify(formatHoldSince(item.since))}`)}>${escape_html(formatHold(item.since))}</span>`);
								} else $$renderer.push("<!--[-1-->");
								$$renderer.push(`<!--]--></button>`);
							}
							$$renderer.push(`<!--]--></div></div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (story()) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="border-2 border-black bg-white px-5 py-4 shadow-sm"><div class="mb-3 flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-2"><h3 class="text-sm font-black uppercase">${escape_html(story().part)}</h3> `);
							levelMark($$renderer, story().level);
							$$renderer.push(`<!----> <span class="text-[10px] font-black text-gray-400 uppercase">${escape_html(story().family)}</span></div> <button type="button" class="text-[9px] font-black uppercase text-gray-400">Close</button></div> `);
							if (story().vol) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<p class="mb-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">${escape_html(plantArea() === "FINISH" ? "Passed" : "Built")}</p> <div class="mb-3 flex flex-wrap gap-2"><!--[-->`);
								const each_array_16 = ensure_array_like(selectedVolume().columns);
								for (let $$index_13 = 0, $$length = each_array_16.length; $$index_13 < $$length; $$index_13++) {
									let col = each_array_16[$$index_13];
									if (story().vol.cells?.[col.key]) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<span class="border border-zinc-200 px-2 py-1 text-[9px] font-black uppercase">${escape_html(col.label)} <span class="ml-1 font-mono">${escape_html(story().vol.cells[col.key].toLocaleString("en-US"))}</span></span>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]-->`);
								}
								$$renderer.push(`<!--]--></div>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--> `);
							if (story().inv) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<p class="mb-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">Sitting between processes</p> <div class="flex flex-wrap gap-2"><!--[-->`);
								const each_array_17 = ensure_array_like(selectedInventory().columns);
								for (let $$index_14 = 0, $$length = each_array_17.length; $$index_14 < $$length; $$index_14++) {
									let col = each_array_17[$$index_14];
									if (story().inv.cells?.[col.key]) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<span class="border border-[#FF4F00] px-2 py-1 text-[9px] font-black uppercase">${escape_html(col.label)} <span class="ml-1 font-mono">${escape_html(story().inv.cells[col.key].toLocaleString("en-US"))}</span> `);
										if (story().inv.ages?.[col.key]) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<span class="ml-1 text-[#FF4F00]"${attr("title", `Sitting since ${stringify(formatHoldSince(story().inv.ages[col.key]))}`)}>${escape_html(formatHold(story().inv.ages[col.key]))}</span>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--></span>`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]-->`);
								}
								$$renderer.push(`<!--]--></div>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]--></div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (filteredVolume()) {
							$$renderer.push("<!--[0-->");
							const table = filteredVolume();
							$$renderer.push(`<div class="overflow-x-auto border bg-white p-5 shadow-sm"><div class="mb-4 flex flex-wrap items-center justify-between gap-4"><div class="flex flex-wrap items-center gap-3"><h3 class="border-l-2 border-[#FF4F00] pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">${escape_html(table.type)} ${escape_html(plantArea() === "FINISH" ? "Finish volume" : "Build volume")}</h3> `);
							levelLegend($$renderer);
							$$renderer.push(`<!----></div> <button class="cursor-pointer bg-green-700 px-6 py-2 text-[10px] font-black text-white uppercase shadow-xs transition-all hover:bg-green-800 active:scale-95">Export CSV</button></div> <table class="volume-ledger w-full table-fixed border-collapse text-left svelte-1uha8ag"><thead><tr class="bg-[#1A1A1A] text-[8px] font-black tracking-wider text-white uppercase"><th class="sticky left-0 w-52 bg-[#1A1A1A] px-2 py-2 text-[#FF4F00]">`);
							if (collectGroupIds(table.rows).length) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<button type="button" class="inline-flex cursor-pointer items-center gap-2 text-[#FF4F00]"><span class="text-[8px]">${escape_html(collectGroupIds(table.rows).every((id) => openFamilyGroups[id]) ? "▼" : "▶")}</span> FAMILY</button>`);
							} else {
								$$renderer.push("<!--[-1-->");
								$$renderer.push(`FAMILY`);
							}
							$$renderer.push(`<!--]--></th><!--[-->`);
							const each_array_18 = ensure_array_like(table.columns);
							for (let $$index_15 = 0, $$length = each_array_18.length; $$index_15 < $$length; $$index_15++) {
								let col = each_array_18[$$index_15];
								$$renderer.push(`<th class="px-1 py-2 text-center"${attr("title", col.title || void 0)}>${escape_html(col.label)}</th>`);
							}
							$$renderer.push(`<!--]--></tr></thead><tbody class="svelte-1uha8ag">`);
							if (table.rows.length) {
								$$renderer.push("<!--[0-->");
								volumeRows($$renderer, table.rows, table.columns, 0, false, "", !!table.showZeros);
							} else {
								$$renderer.push("<!--[-1-->");
								$$renderer.push(`<tr class="svelte-1uha8ag"><td${attr("colspan", table.columns.length + 1)} class="py-6 text-center text-[10px] font-black tracking-widest text-gray-400 uppercase">No rows for this filter</td></tr>`);
							}
							$$renderer.push(`<!--]--></tbody><tfoot class="svelte-1uha8ag"><tr class="border-t-2 border-black text-[10px] font-black svelte-1uha8ag"><td class="sticky left-0 py-2 pr-3 uppercase svelte-1uha8ag">Total</td><!--[-->`);
							const each_array_19 = ensure_array_like(table.columns);
							for (let $$index_16 = 0, $$length = each_array_19.length; $$index_16 < $$length; $$index_16++) {
								let col = each_array_19[$$index_16];
								const columnTotal = table.rows.reduce((sum, row) => sum + (row.cells[col.key] || 0), 0);
								$$renderer.push(`<td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(columnTotal || table.showZeros ? (columnTotal || 0).toLocaleString("en-US") : "")}</td>`);
							}
							$$renderer.push(`<!--]--></tr></tfoot></table></div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="border bg-white px-5 py-10 text-center"><p class="text-[11px] font-black tracking-widest text-gray-400 uppercase">Select a value stream to see volume, inventory and tracking</p></div>`);
				}
				$$renderer.push(`<!--]-->  <div class="grid grid-cols-1 gap-6 lg:grid-cols-12"><section class="space-y-6 lg:col-span-9"><div class="relative h-[450px] border bg-white p-6 shadow-sm"><h3 class="mb-4 border-l-2 border-[#FF4F00] pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">Real-Time Production Trend</h3> `);
				MainProductionChart($$renderer, {
					trendData: dashboard().trend,
					accentColor: accentColor(),
					isReadOnly: data.isReadOnly,
					targetRate: dashboard().totalRate,
					get filterHour() {
						return filterHour;
					},
					set filterHour($$value) {
						filterHour = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----></div> <div class="border bg-white p-6 shadow-sm"><h3 class="mb-6 border-l-2 border-blue-600 pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">Produced Families Heat-Grid</h3> <div class="grid grid-cols-2 gap-4 md:grid-cols-5"><!--[-->`);
				const each_array_22 = ensure_array_like(dashboard().topFamilies);
				for (let $$index_22 = 0, $$length = each_array_22.length; $$index_22 < $$length; $$index_22++) {
					let fam = each_array_22[$$index_22];
					$$renderer.push(`<button${attr_class(`cursor-pointer border-t-4 bg-gray-50 p-3 text-left transition-all hover:scale-105 ${stringify(filterFamily === fam.name ? "border-[#0070f3] bg-blue-50" : "")}`)}><span${attr_class(`block truncate text-[10px] font-black uppercase ${stringify(filterFamily === fam.name ? "text-[#0070f3]" : "")}`)}>${escape_html(fam.name)}</span> <span class="text-xl font-mono font-black">${escape_html(fam.qty.toLocaleString("en-US"))}</span> <div class="mt-1 text-[8px] font-bold text-gray-400 uppercase">${escape_html((fam.qty / (dashboard().totalProduced || 1) * 100).toFixed(1))}% Share</div></button>`);
				}
				$$renderer.push(`<!--]--></div></div></section> <aside class="space-y-6 lg:col-span-3"><h3 class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Process Nav</h3> <div class="max-h-[300px] space-y-2 overflow-y-auto pr-2"><!--[-->`);
				const each_array_23 = ensure_array_like(dashboard().stats);
				for (let $$index_23 = 0, $$length = each_array_23.length; $$index_23 < $$length; $$index_23++) {
					let proc = each_array_23[$$index_23];
					$$renderer.push(`<div class="flex gap-1"><button${attr_class(`flex-1 border bg-white p-3 text-left transition-all ${stringify(filterProcess === proc.name ? "border-[#0070f3] bg-blue-50" : "border-gray-100")}`)}><span class="text-[10px] font-black uppercase">${escape_html(proc.name)}</span> <span${attr_class(`block text-lg font-black ${stringify(proc.efficiency < 85 ? "text-red-500" : "text-green-600")}`)}>${escape_html(proc.efficiency)}%</span> `);
					if (proc.programmed > 0) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="block text-[8px] font-bold tracking-wide text-sky-700 uppercase">${escape_html(Math.round(proc.programmed))}m programmed out</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></button> <a${attr("href", captureHref$1(proc.name))} class="flex items-center justify-center bg-[#1A1A1A] px-3 text-[9px] font-black text-white uppercase transition-colors hover:bg-[#FF4F00]">${escape_html(data.isReadOnly ? "View" : "Capture")}</a></div>`);
				}
				$$renderer.push(`<!--]--></div> <div class="space-y-6 border-t-4 border-red-600 bg-[#1A1A1A] p-4 shadow-xl"><div><h3 class="mb-3 text-[10px] font-black tracking-widest text-gray-500 uppercase">Critical stations</h3> <div class="space-y-2">`);
				const each_array_24 = ensure_array_like(dashboard().criticalMachines);
				if (each_array_24.length !== 0) {
					$$renderer.push("<!--[-->");
					for (let $$index_24 = 0, $$length = each_array_24.length; $$index_24 < $$length; $$index_24++) {
						let station = each_array_24[$$index_24];
						$$renderer.push(`<div class="flex items-center justify-between gap-2 text-[9px] font-bold text-white uppercase"><span class="truncate">${escape_html(station.name)}</span> <span class="shrink-0 text-red-400">${escape_html(station.mins)}m</span></div>`);
					}
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push(`<p class="text-[9px] font-bold text-gray-500 uppercase">No downtime in this filter</p>`);
				}
				$$renderer.push(`<!--]--></div></div> <div class="space-y-3"><h3 class="text-[10px] font-black tracking-widest text-gray-500 uppercase">Unplanned loss</h3> `);
				if (dashboard().programmedMinutes > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="text-[8px] font-bold tracking-wide text-sky-400 uppercase">${escape_html(Math.round(dashboard().programmedMinutes))}m programmed, out of efficiency</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				const each_array_25 = ensure_array_like(dashboard().topFailures);
				if (each_array_25.length !== 0) {
					$$renderer.push("<!--[-->");
					for (let $$index_25 = 0, $$length = each_array_25.length; $$index_25 < $$length; $$index_25++) {
						let fail = each_array_25[$$index_25];
						$$renderer.push(`<button class="w-full text-left"><div${attr_class(`mb-1 flex justify-between text-[9px] font-bold uppercase ${stringify(filterFailure === fail.name ? "text-red-500" : "text-white")}`)}><span class="truncate pr-2">${escape_html(fail.name)}</span> <span class="shrink-0">${escape_html(fail.mins)}m</span></div> <div class="h-1 w-full bg-gray-800"><div${attr_class(`h-full transition-all ${stringify(filterFailure === fail.name ? "bg-white" : "bg-red-600")}`)}${attr_style(`width: ${stringify(fail.mins / (dashboard().topFailures[0]?.mins || 1) * 100)}%`)}></div></div></button>`);
					}
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push(`<p class="text-[9px] font-bold text-gray-500 uppercase">No failures recorded</p>`);
				}
				$$renderer.push(`<!--]--></div></div></aside></div>`);
			}
			$$renderer.push(`<!--]--> `);
			if (hasActiveFilters()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="fixed right-6 bottom-6 z-50 bg-[#FF4F00] px-6 py-3 text-[10px] font-black text-white uppercase shadow-2xl">Clear All Filters</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> <footer class="mx-auto max-w-7xl p-12 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Aptiv Manufacturing System • Intelligent Plant Monitoring</footer>`);
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
//# sourceMappingURL=_page.svelte-DKYRwYjl.js.map
