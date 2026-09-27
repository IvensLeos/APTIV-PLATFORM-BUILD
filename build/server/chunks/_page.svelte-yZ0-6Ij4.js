import { T as attr_class, V as stringify, a6 as attr_style, U as escape_html, S as attr, a7 as ensure_array_like, K as derived, a8 as bind_props } from './dev-CorMzolj.js';
import { b as buildTimeline } from './plantTime-RlOFrl7D.js';
import { e as extractHourMinute } from './captureFormat-FFTiojiT.js';
import './client-ByYMSKKg.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'jspdf';
import 'jspdf-autotable';
import './index-server-CQ5DdqbI.js';
import './internal-C0ucU1d4.js';
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
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let filterType = "ALL";
		let filterProcess = "ALL";
		let filterHour = "ALL";
		let filterShift = "ALL";
		let filterFailure = "ALL";
		let filterFamily = "ALL";
		let volumeFrom = "";
		let volumeTo = "";
		const volumeRangeActive = derived(() => Boolean(volumeFrom));
		const hasActiveFilters = derived(() => filterHour !== "ALL" || filterShift !== "ALL" || filterFailure !== "ALL" || filterFamily !== "ALL");
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
			if (!hasActiveFilters()) return `${datePart} > PLANT DASHBOARD`;
			const path = [datePart, "PLANT" ];
			if (filterHour !== "ALL") path.push(filterHour);
			return path.join(" > ");
		});
		const activeData = derived(() => {
			let scoped = [...data.logs];
			if (filterHour !== "ALL") scoped = scoped.filter((l) => timeLabel(l.DISPLAY_ID) === filterHour);
			const streamSource = scoped;
			let filteredLogs = scoped;
			const unjustifiedLogs = filteredLogs.filter(isUnjustified);
			const unjustifiedMins = unjustifiedLogs.reduce((a, l) => a + l.TIME_LOST, 0);
			const totalProduced = filteredLogs.reduce((acc, l) => acc + (l.PRODUCED || 0), 0);
			const totalRate = filteredLogs.reduce((acc, l) => acc + (l.RATE || 0), 0);
			const seenBlocks = new Set(filteredLogs.map((l) => timeLabel(l.DISPLAY_ID)).filter(Boolean)).size;
			const dayBlocks = buildTimeline(!!data.isSpecialDay).length || 1;
			const projectedFinal = data.isReadOnly ? totalProduced : Math.round(totalProduced / (seenBlocks || 1) * dayBlocks);
			const failureMap = {};
			const machineFailureMap = {};
			const famMap = {};
			filteredLogs.forEach((l) => {
				const comment = l.TIME_LOST_COMMENT;
				if (l.TIME_LOST > 0) {
					if (Array.isArray(comment)) comment.forEach((f) => {
						if (f.code && f.minutes > 0) failureMap[f.code] = (failureMap[f.code] || 0) + Number(f.minutes);
					});
					else if (typeof comment === "string" && comment.trim() !== "") failureMap[comment] = (failureMap[comment] || 0) + l.TIME_LOST;
					const station = `${l.PROCESS} · ${l.MACHINE || "NO MACHINE"}`;
					machineFailureMap[station] = (machineFailureMap[station] || 0) + l.TIME_LOST;
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
			const streamMap = Object.entries(data.streams).map(([type, steps]) => ({
				type,
				steps: steps.map((s) => {
					const stepLogs = streamSource.filter((l) => l.PROCESS === s && l.TYPE === type);
					const d = stepLogs.reduce((acc, curr) => {
						acc.p += curr.PRODUCED;
						acc.r += curr.RATE;
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
			}));
			const procMap = {};
			filteredLogs.forEach((l) => {
				if (!procMap[l.PROCESS]) procMap[l.PROCESS] = {
					name: l.PROCESS,
					p: 0,
					r: 0,
					uMins: 0
				};
				procMap[l.PROCESS].p += l.PRODUCED;
				procMap[l.PROCESS].r += l.RATE;
				if (isUnjustified(l)) procMap[l.PROCESS].uMins += l.TIME_LOST;
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
				]
			};
			const countedSlots = new Set(buildTimeline(!!data.isSpecialDay).map((slot) => slot.time));
			const volumeTables = Object.entries(data.streams).filter(([type]) => filterType === "ALL").map(([type]) => {
				const columns = volumeColumns[type] || [];
				let source = volumeRangeActive() ? [] : filteredLogs;
				if (volumeRangeActive()) ;
				const typeLogs = source.filter((l) => {
					if (l.TYPE !== type || !(l.PRODUCED > 0)) return false;
					if (volumeRangeActive()) return true;
					return countedSlots.has(extractHourMinute(l.DISPLAY_ID));
				});
				const columnKey = (server) => {
					const group = (volumeMerges[type] || []).find((servers) => servers.includes(server));
					return group ? group.join("+") : server;
				};
				const rows = [...new Set(typeLogs.map((l) => l.FAMILY))].sort().map((family) => {
					const cells = {};
					let total = 0;
					for (const log of typeLogs) {
						if (log.FAMILY !== family) continue;
						const key = columnKey(log.SERVER_PROCESS);
						cells[key] = (cells[key] || 0) + log.PRODUCED;
						total += log.PRODUCED;
					}
					return {
						family,
						cells,
						total
					};
				});
				return {
					type,
					columns,
					rows: type === "CONTROLLER" ? groupControllerFamilies(columns, rows) : type === "RADAR" ? groupRadarFamilies(columns, rows) : rows.map((row) => ({
						kind: "family",
						id: row.family,
						...row
					}))
				};
			});
			const inventorySource = volumeRangeActive() ? [] : data.logs;
			const subtypeLinks = buildSubtypeLinks(data.conversions);
			const inventoryTables = Object.entries(data.streams).filter(([type]) => filterType === "ALL").map(([type, steps]) => {
				const columns = [];
				for (let i = 0; i < steps.length - 1; i++) {
					const from = steps[i];
					const to = steps[i + 1];
					if (type === "CONTROLLER" && from === "CONFORMAL" && to === "SCREWDRIVE") columns.push({
						key: "PROGRAMMING|CONFORMAL",
						label: "PROGRAMMING → CONFORMAL"
					});
					columns.push({
						key: `${from}|${to}`,
						label: `${from} → ${to}`
					});
				}
				const byPart = /* @__PURE__ */ new Map();
				for (const log of inventorySource) {
					if (log.TYPE !== type || !(log.PRODUCED > 0) || !steps.includes(log.PROCESS)) continue;
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
					const useS2 = type === "CONTROLLER" || /^KIA\b/i.test(bucket.family);
					if (bucket.level === "RAW BOARD") {
						const shared = sharedRawPool(bucket.family);
						const boards = shared ? null : useS2 ? subtypeLinks.rawToS2.get(bucket.part) : subtypeLinks.rawToS1.get(bucket.part);
						const consumed = shared ? mergeEventMaps([...byPart.values()].filter((row) => row.level === "BOARD" && shared.test.test(row.family) && !sharedRawPool(row.family)).map((row) => shared.useS2 ? row.eventsS2.SMT : row.eventsS1.SMT)) : boards?.size ? mergeEventMaps([...boards].flatMap((part) => eventsFor(part, (row) => useS2 ? row.eventsS2.SMT : row.eventsS1.SMT))) : null;
						if (consumed) {
							const balance = endingInventory(bucket.events["LASER ETCH"], consumed);
							if (balance) bucket.boundary = { "LASER ETCH|SMT": balance };
						}
					}
					if (bucket.level === "BOARD") {
						const modules = useS2 ? subtypeLinks.boardToModulesS2.get(bucket.part) : subtypeLinks.boardToModulesS1.get(bucket.part);
						const consumed = mergeEventMaps([bucket.events.PROGRAMMING, ...[...modules || []].flatMap((part) => eventsFor(part, (row) => row.events.PROGRAMMING))]);
						const balance = endingInventory(bucket.events.XRAY, consumed);
						if (balance) bucket.boundary = {
							...bucket.boundary || {},
							"XRAY|PROGRAMMING": balance
						};
					}
				}
				const byFamily = /* @__PURE__ */ new Map();
				for (const bucket of byPart.values()) {
					const cells = {};
					const bypassEdgebond = type === "CONTROLLER" && skipsEdgebond(bucket.family);
					for (let i = 0; i < steps.length - 1; i++) {
						const from = steps[i];
						const to = steps[i + 1];
						const stage = gapLevel(type, from, to);
						if (stage === "HANDOFF" || stage === "RAW BOARD" || stage !== bucket.level) continue;
						if (bypassEdgebond && (from === "EDGEBOND" || to === "EDGEBOND")) continue;
						let upstream = bucket.events[from];
						const downstream = bucket.events[to];
						if (type === "CONTROLLER" && from === "SMT" && to === "PTH") upstream = bucket.eventsS2[from];
						if (type === "RADAR" && from === "SMT" && to === "XRAY") upstream = /^KIA\b/i.test(bucket.family) ? bucket.eventsS2[from] : bucket.eventsS1[from];
						const balance = endingInventory(upstream, downstream);
						if (balance) cells[`${from}|${to}`] = balance;
					}
					if (bypassEdgebond && bucket.level === "MODULE") {
						const balance = endingInventory(bucket.events.PROGRAMMING, bucket.events.CONFORMAL);
						if (balance) cells["PROGRAMMING|CONFORMAL"] = balance;
					}
					if (bucket.boundary) Object.assign(cells, bucket.boundary);
					if (!Object.keys(cells).length) continue;
					if (!byFamily.has(bucket.family)) byFamily.set(bucket.family, []);
					byFamily.get(bucket.family).push({
						kind: "part",
						id: `INV|${type}|${bucket.family}|${bucket.part}`,
						name: bucket.part,
						cells
					});
				}
				return {
					type,
					columns,
					rows: groupInventoryRows(type, [...new Set(byFamily.keys())].sort((a, b) => a.localeCompare(b, "en")).map((family) => {
						const parts = (byFamily.get(family) || []).sort((a, b) => a.name.localeCompare(b.name, "en"));
						return {
							family,
							cells: sumInventoryCells(parts),
							children: parts
						};
					}).filter((node) => Object.keys(node.cells).length))
				};
			});
			return {
				totalProduced,
				globalEfficiency: totalRate > 0 ? Math.round(totalProduced / totalRate * 100) : 0,
				projectedFinal,
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
				stats: Object.values(procMap).filter((p) => filterType === "ALL").map((p) => ({
					name: p.name,
					efficiency: p.r > 0 ? Math.round(p.p / p.r * 100) : 0,
					unjustified: p.uMins
				})).sort((a, b) => a.efficiency - b.efficiency),
				streamMap,
				volumeTables,
				inventoryTables
			};
		});
		const accentColor = derived(() => {
			return filterHour !== "ALL" || filterShift !== "ALL" || filterFailure !== "ALL" || filterFamily !== "ALL" ? "#0070f3" : "#FF4F00";
		});
		const barColor = derived(() => activeData().unjustifiedCount > 0 ? "#f97316" : accentColor());
		const captureHref = (processName) => `/capture/${processName.toLowerCase().replace(/\s+/g, "-")}?date=${data.selectedDate}`;
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
		function endingInventory(upstream, downstream) {
			const deltas = /* @__PURE__ */ new Map();
			for (const [stamp, qty] of upstream || []) deltas.set(stamp, (deltas.get(stamp) || 0) + qty);
			for (const [stamp, qty] of downstream || []) deltas.set(stamp, (deltas.get(stamp) || 0) - qty);
			let balance = 0;
			for (const stamp of [...deltas.keys()].sort((a, b) => a - b)) {
				const next = balance + deltas.get(stamp);
				balance = next < 0 ? 0 : next;
			}
			return balance;
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
			const boardToModulesS1 = /* @__PURE__ */ new Map();
			const boardToModulesS2 = /* @__PURE__ */ new Map();
			for (const [server, procs] of byServer) {
				if (procs.BOARD_LABEL && procs.SPI_S1) add(rawToS1, procs.BOARD_LABEL, procs.SPI_S1);
				if (procs.BOARD_LABEL && procs.SPI_S2) add(rawToS2, procs.BOARD_LABEL, procs.SPI_S2);
				const stored = procs.PROGRAMMING || server;
				if (procs.SPI_S1 && stored !== procs.SPI_S1) add(boardToModulesS1, procs.SPI_S1, stored);
				if (procs.SPI_S2 && stored !== procs.SPI_S2) add(boardToModulesS2, procs.SPI_S2, stored);
			}
			return {
				rawToS1,
				rawToS2,
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
		function sharedRawPool(family) {
			if (/^KIA & KIA 2026 BOARD$/i.test(family)) return {
				test: /^KIA\b/i,
				useS2: true
			};
			if (/^NISSAN & NISSAN 2026 BOARD$/i.test(family)) return {
				test: /^NISSAN\b/i,
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
		function gapLevel(type, from, to) {
			if (from === "LASER ETCH" && to === "SMT") return "RAW BOARD";
			if (from === "XRAY" && to === "PROGRAMMING") return "HANDOFF";
			const board = type === "CONTROLLER" ? [
				"SMT",
				"PTH",
				"XRAY"
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
				children: children.length === 1 ? children[0].children : children
			};
		}
		function groupInventoryRows(type, nodes) {
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
					children: ecuChildren
				});
				if (cadmChildren.length) grouped.push({
					kind: "group",
					id: "INV|CONTROLLER|GROUP|CADM",
					name: "CADM",
					cells: sumInventoryCells(cadmChildren),
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
				if (board) children.push(inventoryFamilyNode(type, board));
				grouped.push({
					kind: "group",
					id: "INV|RADAR|GROUP|RIVIAN & THUNDER",
					name: "RIVIAN & THUNDER",
					cells: sumInventoryCells(children),
					children
				});
			}
			const plain = nodes.filter((node) => !claimed.has(node.family)).map((node) => inventoryFamilyNode(type, node));
			const radarOrder = [
				"SRR FORD",
				"MRR FORD",
				"SRR FCA",
				"MRR FCA",
				"KIA",
				"NISSAN",
				"RIVIAN & THUNDER"
			];
			const rank = (row) => {
				const index = radarOrder.indexOf(row.name);
				return index === -1 ? radarOrder.length : index;
			};
			return [...plain, ...grouped].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "en"));
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
			else plain.push({
				kind: "family",
				id: row.family,
				...row
			});
			const rollup = (members) => {
				const boards = members.filter((row) => /\bBOARD$/i.test(row.family));
				const variants = members.filter((row) => !/\bBOARD$/i.test(row.family));
				const cells = {};
				for (const row of variants) for (const [key, qty] of Object.entries(row.cells)) cells[key] = (cells[key] || 0) + qty;
				const boardQty = boards.reduce((sum, row) => sum + row.total, 0);
				if (laserKey && boardQty) cells[laserKey] = (cells[laserKey] || 0) + boardQty;
				return {
					cells,
					total: Object.values(cells).reduce((sum, qty) => sum + qty, 0),
					children: variants.map((row) => ({
						kind: "family",
						id: row.family,
						...row
					}))
				};
			};
			const subgroup = (id, name, members) => {
				const rolled = rollup(members);
				if (rolled.children.length <= 1) return {
					kind: "family",
					id,
					name,
					cells: rolled.cells,
					total: rolled.total
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
					children
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
				const children = variants.map((row) => ({
					kind: "family",
					id: row.family,
					...row
				}));
				grouped.push(children.length <= 1 ? {
					kind: "family",
					id,
					name,
					cells,
					total
				} : {
					kind: "group",
					id,
					name,
					cells,
					total,
					children
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
				thunderChildren.push({
					kind: "family",
					id,
					name,
					cells,
					total
				});
			}
			const sharedBoards = rows.filter((row) => /^SRR-FLR4 THUNDER\s*&\s*RIVIAN BOARD$/i.test(row.family));
			sharedBoards.forEach((row) => claimed.add(row.family));
			const sharedBoardQty = sharedBoards.reduce((sum, row) => sum + row.total, 0);
			if (thunderChildren.length || sharedBoardQty) {
				const cells = {};
				for (const child of thunderChildren) for (const [key, qty] of Object.entries(child.cells)) cells[key] = (cells[key] || 0) + qty;
				if (laserKey && sharedBoardQty) cells[laserKey] = (cells[laserKey] || 0) + sharedBoardQty;
				const total = Object.values(cells).reduce((sum, qty) => sum + qty, 0);
				grouped.push({
					kind: "group",
					id: "RIVIAN & THUNDER",
					name: "RIVIAN & THUNDER",
					cells,
					total,
					children: thunderChildren
				});
			}
			const plain = rows.filter((row) => !claimed.has(row.family)).map((row) => ({
				kind: "family",
				id: row.family,
				...row
			}));
			const radarOrder = [
				"SRR FORD",
				"MRR FORD",
				"SRR FCA",
				"MRR FCA",
				"KIA",
				"NISSAN",
				"RIVIAN & THUNDER"
			];
			const rank = (row) => {
				const index = radarOrder.indexOf(row.name || row.family);
				return index === -1 ? radarOrder.length : index;
			};
			return [...plain, ...grouped].sort((a, b) => rank(a) - rank(b) || (a.name || a.family).localeCompare(b.name || b.family));
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mx-auto max-w-[1600px] space-y-6 bg-[#FBFBFB] p-6"><header class="space-y-4 border-b-2 border-black pb-4"><div class="flex flex-wrap items-end justify-between gap-4"><div class="flex min-w-0 items-center gap-4"><div${attr_class(`h-14 w-2 shrink-0 ${stringify(activeData().unjustifiedCount > 0 ? "animate-pulse" : "")}`)}${attr_style("", { "background-color": barColor() })}></div> <div class="min-w-0"><h1 class="text-3xl leading-none font-black tracking-tighter uppercase md:text-4xl">${escape_html(breadcrumb())}</h1> <div class="mt-2 flex flex-wrap items-center gap-3"><span class="flex items-center gap-1 text-[8px] font-bold tracking-widest text-gray-400 uppercase"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span> Last scrape: ${escape_html(data.lastSync || "no record")}</span> `);
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
			const each_array = ensure_array_like([
				"ALL",
				"T09",
				"T25",
				"T08"
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let shift = each_array[$$index];
				$$renderer.push(`<button${attr_class(`border-2 px-3 py-1 text-[9px] font-black transition-all ${stringify(filterShift === shift ? "border-black bg-black text-white" : "border-gray-100 bg-white text-gray-400 hover:border-[#FF4F00]")}`)}>${escape_html(shift)}</button>`);
			}
			$$renderer.push(`<!--]--></div> <button${attr_class(`w-16 border px-3 py-1 text-[10px] font-black uppercase ${stringify(hasActiveFilters() ? "border-gray-300 bg-gray-100" : "pointer-events-none border-transparent text-transparent")}`)}>Reset</button> <div class="min-w-[200px] border-l pl-6 text-right"><span class="font-mono text-3xl font-black">${escape_html(activeData().totalProduced.toLocaleString("en-US"))}</span> `);
			if (!data.isReadOnly) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="text-[10px] font-black text-gray-400 uppercase">Est. Final: <span class="text-[#FF4F00] italic">${escape_html(activeData().projectedFinal.toLocaleString("en-US"))} PCS</span></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div></header> `);
			if (data.logs.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center"><p class="text-sm font-black tracking-widest text-gray-500 uppercase">No production recorded for this operating day</p> <p class="mt-2 text-[10px] font-bold text-gray-400 uppercase">Pick another date to review a day with data</p></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				function volumeRows($$renderer, entries, columns, depth, withRowTotal = false) {
					$$renderer.push(`<!--[-->`);
					const each_array_1 = ensure_array_like(entries);
					for (let $$index_10 = 0, $$length = each_array_1.length; $$index_10 < $$length; $$index_10++) {
						let row = each_array_1[$$index_10];
						const rowTotal = columns.reduce((sum, col) => sum + (withRowTotal && col.key === "LASER ETCH|SMT" ? 0 : row.cells[col.key] || 0), 0);
						$$renderer.push(`<tr class="border-b border-zinc-100 text-[10px] svelte-1uha8ag"><td${attr_class(`sticky left-0 py-2 pr-3 uppercase ${stringify(depth ? "font-bold" : "font-black")}`, "svelte-1uha8ag")}${attr_style("", { "padding-left": `${stringify(depth * 1.25)}rem` })}>`);
						if (row.kind === "group" && row.children?.length) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<button class="inline-flex items-center gap-2"><span class="text-[8px]">${escape_html(openFamilyGroups[row.id] ? "▼" : "▶")}</span> ${escape_html(row.name)}</button>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`${escape_html(row.name || row.family)}`);
						}
						$$renderer.push(`<!--]--></td><!--[-->`);
						const each_array_2 = ensure_array_like(columns);
						for (let $$index_9 = 0, $$length = each_array_2.length; $$index_9 < $$length; $$index_9++) {
							let col = each_array_2[$$index_9];
							$$renderer.push(`<td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(row.cells[col.key] ? row.cells[col.key].toLocaleString("en-US") : "")}</td>`);
						}
						$$renderer.push(`<!--]-->`);
						if (withRowTotal) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<td class="px-1 py-2 text-center font-mono font-black tabular-nums"${attr("title", withRowTotal ? "Does not include LASER ETCH Inventory. Those pieces are not physically built yet." : void 0)}>${escape_html(rowTotal ? rowTotal.toLocaleString("en-US") : "")}</td>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></tr> `);
						if (row.kind === "group" && openFamilyGroups[row.id]) {
							$$renderer.push("<!--[0-->");
							volumeRows($$renderer, row.children, columns, depth + 1, withRowTotal);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<div class="grid grid-cols-1 gap-4"><!--[-->`);
				const each_array_3 = ensure_array_like(activeData().streamMap);
				for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
					let stream = each_array_3[$$index_2];
					$$renderer.push(`<div${attr_class(`border-2 bg-white p-5 ${stringify(filterType === stream.type ? "border-[#FF4F00] shadow-lg" : "")}`)}><button class="mb-4 flex w-full items-center justify-between text-left"><span${attr_class(`text-[11px] font-black uppercase ${stringify(filterType === stream.type ? "text-[#FF4F00]" : "")}`)}>${escape_html(stream.type)} Value Stream</span> <span class="text-[9px] font-bold text-gray-400 uppercase">${escape_html(data.familyMapping[stream.type]?.length || 0)} Families</span></button> <div class="flex w-full items-stretch gap-1"><!--[-->`);
					const each_array_4 = ensure_array_like(stream.steps);
					for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
						let step = each_array_4[i];
						$$renderer.push(`<button${attr_class(`relative min-w-0 flex-1 border px-1 py-2 text-center transition-all ${stringify(filterType === stream.type && filterProcess === step.name ? "border-[#0070f3] bg-blue-50 outline outline-2 outline-[#0070f3]" : !step.hasData ? "border-[#333] bg-[#2a2a2a] text-gray-500" : step.efficiency < 85 ? "border-red-700 bg-red-500 text-white" : "border-green-800 bg-green-600 text-white")}`)}><span class="block truncate text-[9px] font-black uppercase">${escape_html(step.name)}</span> <span class="text-[11px] font-black">${escape_html(step.efficiency)}%</span> `);
						if (step.hasPending) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="absolute top-0 right-0 h-2 w-2 animate-pulse rounded-bl-sm bg-orange-400"></span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></button> `);
						if (i < stream.steps.length - 1) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="shrink-0 self-center px-0.5 text-[10px] font-black text-gray-300">›</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]--></div></div>`);
				}
				$$renderer.push(`<!--]--></div> <div class="space-y-6"><div class="flex flex-wrap items-end justify-between gap-4 border bg-white px-5 py-4 shadow-sm"><div><span class="block text-[10px] font-black tracking-widest text-gray-400 uppercase">Volume date range</span> <span class="mt-1 block text-[9px] font-bold text-gray-400 uppercase">`);
				if (volumeRangeActive()) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`Summed from ${escape_html(volumeFrom)} to ${escape_html(volumeTo)}`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`Showing ${escape_html(data.selectedDate)}`);
				}
				$$renderer.push(`<!--]--></span> `);
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="flex flex-wrap items-end gap-3"><label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">From <input type="date"${attr("value", volumeFrom)} class="border-2 border-black px-2 py-1 text-[10px] font-black text-zinc-900 outline-none"/></label> <label class="flex flex-col gap-1 text-[9px] font-black tracking-widest text-gray-400 uppercase">To <input type="date"${attr("value", volumeTo)} class="border-2 border-black px-2 py-1 text-[10px] font-black text-zinc-900 outline-none"/></label></div></div> <!--[-->`);
				const each_array_5 = ensure_array_like(activeData().volumeTables);
				for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
					let table = each_array_5[$$index_5];
					$$renderer.push(`<div class="overflow-x-auto border bg-white p-5 shadow-sm"><div class="mb-4 flex items-center justify-between gap-4"><h3 class="border-l-2 border-[#FF4F00] pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">${escape_html(table.type)} Build Volume</h3> <button class="cursor-pointer bg-green-700 px-6 py-2 text-[10px] font-black text-white uppercase shadow-xs transition-all hover:bg-green-800 active:scale-95">Export CSV</button></div> <table class="volume-ledger w-full table-fixed border-collapse text-left svelte-1uha8ag"><thead><tr class="bg-[#1A1A1A] text-[8px] font-black tracking-wider text-white uppercase"><th class="sticky left-0 w-40 bg-[#1A1A1A] px-2 py-2 text-[#FF4F00]">`);
					if (collectGroupIds(table.rows).length) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button type="button" class="inline-flex cursor-pointer items-center gap-2 text-[#FF4F00]"><span class="text-[8px]">${escape_html(collectGroupIds(table.rows).every((id) => openFamilyGroups[id]) ? "▼" : "▶")}</span> FAMILY</button>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`FAMILY`);
					}
					$$renderer.push(`<!--]--></th><!--[-->`);
					const each_array_6 = ensure_array_like(table.columns);
					for (let $$index_3 = 0, $$length = each_array_6.length; $$index_3 < $$length; $$index_3++) {
						let col = each_array_6[$$index_3];
						$$renderer.push(`<th class="px-1 py-2 text-center">${escape_html(col.label)}</th>`);
					}
					$$renderer.push(`<!--]--></tr></thead><tbody class="svelte-1uha8ag">`);
					volumeRows($$renderer, table.rows, table.columns, 0);
					$$renderer.push(`<!----></tbody><tfoot class="svelte-1uha8ag"><tr class="border-t-2 border-black text-[10px] font-black svelte-1uha8ag"><td class="sticky left-0 py-2 pr-3 uppercase svelte-1uha8ag">Total</td><!--[-->`);
					const each_array_7 = ensure_array_like(table.columns);
					for (let $$index_4 = 0, $$length = each_array_7.length; $$index_4 < $$length; $$index_4++) {
						let col = each_array_7[$$index_4];
						const columnTotal = table.rows.reduce((sum, row) => sum + (row.cells[col.key] || 0), 0);
						$$renderer.push(`<td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(columnTotal ? columnTotal.toLocaleString("en-US") : "")}</td>`);
					}
					$$renderer.push(`<!--]--></tr></tfoot></table></div>`);
				}
				$$renderer.push(`<!--]--> <!--[-->`);
				const each_array_8 = ensure_array_like(activeData().inventoryTables);
				for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
					let table = each_array_8[$$index_8];
					$$renderer.push(`<div class="overflow-x-auto border bg-white p-5 shadow-sm"><div class="mb-4 flex items-center justify-between gap-4"><h3 class="border-l-2 border-[#FF4F00] pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">${escape_html(table.type)} Inventory</h3> <button class="cursor-pointer bg-green-700 px-6 py-2 text-[10px] font-black text-white uppercase shadow-xs transition-all hover:bg-green-800 active:scale-95">Export CSV</button></div> <table class="volume-ledger w-full table-fixed border-collapse text-left svelte-1uha8ag"><thead><tr class="bg-[#1A1A1A] text-[8px] font-black tracking-wider text-white uppercase"><th class="sticky left-0 w-40 bg-[#1A1A1A] px-2 py-2 text-[#FF4F00]">`);
					if (collectGroupIds(table.rows).length) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button type="button" class="inline-flex cursor-pointer items-center gap-2 text-[#FF4F00]"><span class="text-[8px]">${escape_html(collectGroupIds(table.rows).every((id) => openFamilyGroups[id]) ? "▼" : "▶")}</span> FAMILY</button>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`FAMILY`);
					}
					$$renderer.push(`<!--]--></th><!--[-->`);
					const each_array_9 = ensure_array_like(table.columns);
					for (let $$index_6 = 0, $$length = each_array_9.length; $$index_6 < $$length; $$index_6++) {
						let col = each_array_9[$$index_6];
						$$renderer.push(`<th class="px-1 py-2 text-center">${escape_html(col.label)}</th>`);
					}
					$$renderer.push(`<!--]--><th class="w-20 px-1 py-2 text-center text-[#FF4F00]">Total</th></tr></thead><tbody class="svelte-1uha8ag">`);
					volumeRows($$renderer, table.rows, table.columns, 0, true);
					$$renderer.push(`<!----></tbody><tfoot class="svelte-1uha8ag"><tr class="border-t-2 border-black text-[10px] font-black svelte-1uha8ag"><td class="sticky left-0 py-2 pr-3 uppercase svelte-1uha8ag">Total</td><!--[-->`);
					const each_array_10 = ensure_array_like(table.columns);
					for (let $$index_7 = 0, $$length = each_array_10.length; $$index_7 < $$length; $$index_7++) {
						let col = each_array_10[$$index_7];
						const columnTotal = table.rows.reduce((sum, row) => sum + (row.cells[col.key] || 0), 0);
						$$renderer.push(`<td class="px-1 py-2 text-center font-mono tabular-nums">${escape_html(columnTotal ? columnTotal.toLocaleString("en-US") : "")}</td>`);
					}
					$$renderer.push(`<!--]--><td class="px-1 py-2 text-center font-mono font-black tabular-nums" title="Does not include LASER ETCH Inventory. Those pieces are not physically built yet.">${escape_html(table.rows.reduce((sum, row) => sum + table.columns.reduce((rowSum, col) => rowSum + (col.key === "LASER ETCH|SMT" ? 0 : row.cells[col.key] || 0), 0), 0).toLocaleString("en-US"))}</td></tr></tfoot></table></div>`);
				}
				$$renderer.push(`<!--]--></div> <div class="grid grid-cols-1 gap-6 lg:grid-cols-12"><section class="space-y-6 lg:col-span-9"><div class="relative h-[450px] border bg-white p-6 shadow-sm"><h3 class="mb-4 border-l-2 border-[#FF4F00] pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">Real-Time Production Trend</h3> `);
				MainProductionChart($$renderer, {
					trendData: activeData().trend,
					accentColor: accentColor(),
					isReadOnly: data.isReadOnly,
					targetRate: activeData().totalRate,
					get filterHour() {
						return filterHour;
					},
					set filterHour($$value) {
						filterHour = $$value;
						$$settled = false;
					}
				});
				$$renderer.push(`<!----></div> <div class="border bg-white p-6 shadow-sm"><h3 class="mb-6 border-l-2 border-blue-600 pl-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">Produced Families Heat-Grid</h3> <div class="grid grid-cols-2 gap-4 md:grid-cols-5"><!--[-->`);
				const each_array_11 = ensure_array_like(activeData().topFamilies);
				for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
					let fam = each_array_11[$$index_11];
					$$renderer.push(`<button${attr_class(`cursor-pointer border-t-4 bg-gray-50 p-3 text-left transition-all hover:scale-105 ${stringify(filterFamily === fam.name ? "border-[#0070f3] bg-blue-50" : "")}`)}><span${attr_class(`block truncate text-[10px] font-black uppercase ${stringify(filterFamily === fam.name ? "text-[#0070f3]" : "")}`)}>${escape_html(fam.name)}</span> <span class="text-xl font-mono font-black">${escape_html(fam.qty.toLocaleString("en-US"))}</span> <div class="mt-1 text-[8px] font-bold text-gray-400 uppercase">${escape_html((fam.qty / (activeData().totalProduced || 1) * 100).toFixed(1))}% Share</div></button>`);
				}
				$$renderer.push(`<!--]--></div></div></section> <aside class="space-y-6 lg:col-span-3"><h3 class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Process Nav</h3> <div class="max-h-[300px] space-y-2 overflow-y-auto pr-2"><!--[-->`);
				const each_array_12 = ensure_array_like(activeData().stats);
				for (let $$index_12 = 0, $$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
					let proc = each_array_12[$$index_12];
					$$renderer.push(`<div class="flex gap-1"><button${attr_class(`flex-1 border bg-white p-3 text-left transition-all ${stringify(filterProcess === proc.name ? "border-[#0070f3] bg-blue-50" : "border-gray-100")}`)}><span class="text-[10px] font-black uppercase">${escape_html(proc.name)}</span> <span${attr_class(`block text-lg font-black ${stringify(proc.efficiency < 85 ? "text-red-500" : "text-green-600")}`)}>${escape_html(proc.efficiency)}%</span></button> <a${attr("href", captureHref(proc.name))} class="flex items-center justify-center bg-[#1A1A1A] px-3 text-[9px] font-black text-white uppercase transition-colors hover:bg-[#FF4F00]">${escape_html(data.isReadOnly ? "View" : "Capture")}</a></div>`);
				}
				$$renderer.push(`<!--]--></div> <div class="space-y-6 border-t-4 border-red-600 bg-[#1A1A1A] p-4 shadow-xl"><div><h3 class="mb-3 text-[10px] font-black tracking-widest text-gray-500 uppercase">Critical stations</h3> <div class="space-y-2">`);
				const each_array_13 = ensure_array_like(activeData().criticalMachines);
				if (each_array_13.length !== 0) {
					$$renderer.push("<!--[-->");
					for (let $$index_13 = 0, $$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
						let station = each_array_13[$$index_13];
						$$renderer.push(`<div class="flex items-center justify-between gap-2 text-[9px] font-bold text-white uppercase"><span class="truncate">${escape_html(station.name)}</span> <span class="shrink-0 text-red-400">${escape_html(station.mins)}m</span></div>`);
					}
				} else {
					$$renderer.push("<!--[!-->");
					$$renderer.push(`<p class="text-[9px] font-bold text-gray-500 uppercase">No downtime in this filter</p>`);
				}
				$$renderer.push(`<!--]--></div></div> <div class="space-y-3"><h3 class="text-[10px] font-black tracking-widest text-gray-500 uppercase">Loss Distribution</h3> `);
				const each_array_14 = ensure_array_like(activeData().topFailures);
				if (each_array_14.length !== 0) {
					$$renderer.push("<!--[-->");
					for (let $$index_14 = 0, $$length = each_array_14.length; $$index_14 < $$length; $$index_14++) {
						let fail = each_array_14[$$index_14];
						$$renderer.push(`<button class="w-full text-left"><div${attr_class(`mb-1 flex justify-between text-[9px] font-bold uppercase ${stringify(filterFailure === fail.name ? "text-red-500" : "text-white")}`)}><span class="truncate pr-2">${escape_html(fail.name)}</span> <span class="shrink-0">${escape_html(fail.mins)}m</span></div> <div class="h-1 w-full bg-gray-800"><div${attr_class(`h-full transition-all ${stringify(filterFailure === fail.name ? "bg-white" : "bg-red-600")}`)}${attr_style(`width: ${stringify(fail.mins / (activeData().topFailures[0]?.mins || 1) * 100)}%`)}></div></div></button>`);
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
//# sourceMappingURL=_page.svelte-yZ0-6Ij4.js.map
