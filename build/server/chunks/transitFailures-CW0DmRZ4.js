import { l as levelRuleKey, i as isFailureTransit, e as expectedLevel, n as normalizeLevel } from './pieceLevel-B94ZE9fG.js';

//#region src/lib/server/transitFailures.js
/** Reglas confirmadas. EDEGEBOND del piso es EDGEBOND. */
var SEED_RULES = [
	[
		"28765747",
		"UNDERFILL",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28866865",
		"ICT",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28723125",
		"EDGEBOND",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28764047",
		"EDGEBOND",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28769363",
		"EDGEBOND",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28775837",
		"EDGEBOND",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28796430",
		"EDGEBOND",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28777295",
		"EDGEBOND",
		"NUMERO DE PARTE SMT (2), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28777288",
		"EDGEBOND",
		"NUMERO DE PARTE SMT (2), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28723125",
		"ROUTERMILLING",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28764047",
		"ROUTERMILLING",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28769363",
		"ROUTERMILLING",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28775837",
		"ROUTERMILLING",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28796430",
		"ROUTERMILLING",
		"NUMERO DE PARTE SMT (1), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28777295",
		"ROUTERMILLING",
		"NUMERO DE PARTE SMT (2), SE TOMA COMO FALLA EN ESTE EQUIPO"
	],
	[
		"28777288",
		"ROUTERMILLING",
		"NUMERO DE PARTE SMT (2), SE TOMA COMO FALLA EN ESTE EQUIPO"
	]
];
/** Nivel distinto al esperado, pero es producción válida. No se vuelve a resaltar. */
var VALID_SEEDS = [["28899922", "ROUTERMILLING"]];
function isFailureVerdict(rule) {
	return rule?.VERDICT !== "VALID";
}
var RULES = "FAILURE_RULES";
var FAILURES = "TRANSIT_FAILURES";
var CHUNK = 400;
var ruleCache = null;
var settled = false;
var settling = null;
function ruleKey(part, process) {
	return levelRuleKey(part, process);
}
function ruleMap(rules) {
	return new Map((rules || []).map((rule) => [ruleKey(rule.PARTNUMBER, rule.PROCESS), rule]));
}
function clearRuleCache() {
	ruleCache = null;
	settled = false;
}
async function ensureIndexes(db) {
	await Promise.all([
		db.collection(RULES).createIndex({
			PARTNUMBER: 1,
			PROCESS: 1
		}, {
			name: "unique_failure_rule",
			unique: true
		}),
		db.collection(FAILURES).createIndex({ IDENTIFIER: 1 }, {
			name: "unique_transit_failure",
			unique: true
		}),
		db.collection(FAILURES).createIndex({
			MACHINE: 1,
			OEEDATE: 1
		}, { name: "idx_transit_machine_day" }),
		db.collection("OEES").createIndex({
			PARTNUMBER: 1,
			PROCESS: 1
		}, { name: "idx_oee_part_process" })
	]);
}
async function ensureFailureRules(db) {
	await ensureIndexes(db);
	const now = /* @__PURE__ */ new Date();
	await db.collection(RULES).bulkWrite(SEED_RULES.map(([PARTNUMBER, PROCESS, ERROR]) => ({ updateOne: {
		filter: {
			PARTNUMBER,
			PROCESS
		},
		update: { $setOnInsert: {
			PARTNUMBER,
			PROCESS,
			ERROR,
			VERDICT: "FAILURE",
			ACTIVE: true,
			createdAt: now
		} },
		upsert: true
	} })), { ordered: false });
	if (!VALID_SEEDS.length) return;
	await db.collection(RULES).bulkWrite(VALID_SEEDS.map(([PARTNUMBER, PROCESS]) => ({ updateOne: {
		filter: {
			PARTNUMBER,
			PROCESS
		},
		update: { $setOnInsert: {
			PARTNUMBER,
			PROCESS,
			ERROR: "",
			VERDICT: "VALID",
			ACTIVE: true,
			createdAt: now
		} },
		upsert: true
	} })), { ordered: false });
}
async function loadActiveRules(db) {
	if (ruleCache && Date.now() - ruleCache.at < 6e4) return ruleCache.rules;
	await ensureFailureRules(db);
	const rules = await db.collection(RULES).find({ ACTIVE: true }).sort({
		PROCESS: 1,
		PARTNUMBER: 1
	}).toArray();
	ruleCache = {
		at: Date.now(),
		rules
	};
	return rules;
}
function withoutMongoId(doc) {
	const copy = { ...doc };
	delete copy._id;
	return copy;
}
async function writeChunks(collection, ops) {
	for (let i = 0; i < ops.length; i += CHUNK) await collection.bulkWrite(ops.slice(i, i + CHUNK), { ordered: false });
}
async function deleteIdentifiers(collection, ids) {
	for (let i = 0; i < ids.length; i += CHUNK) await collection.deleteMany({ IDENTIFIER: { $in: ids.slice(i, i + CHUNK) } });
}
/** Saca de OEES los intervalos con regla de falla activa. Una regla válida se queda en OEES. */
async function divertMatching(db, rules) {
	const active = (rules || await loadActiveRules(db)).filter(isFailureVerdict);
	if (!active.length) return 0;
	const known = ruleMap(active);
	const docs = await db.collection("OEES").find({ $or: active.map((rule) => ({
		PARTNUMBER: rule.PARTNUMBER,
		PROCESS: rule.PROCESS
	})) }).toArray();
	if (!docs.length) return 0;
	const now = /* @__PURE__ */ new Date();
	const ops = [];
	const ids = [];
	for (const doc of docs) {
		if (!doc.IDENTIFIER) continue;
		const rule = known.get(ruleKey(doc.PARTNUMBER, doc.PROCESS));
		ops.push({ updateOne: {
			filter: { IDENTIFIER: doc.IDENTIFIER },
			update: { $set: {
				...withoutMongoId(doc),
				RULE_ERROR: rule?.ERROR || "",
				MOVED_AT: now
			} },
			upsert: true
		} });
		ids.push(doc.IDENTIFIER);
	}
	await writeChunks(db.collection(FAILURES), ops);
	await deleteIdentifiers(db.collection("OEES"), ids);
	return ids.length;
}
/** Primera visita de captura en este proceso: aplica las reglas ya confirmadas. */
async function settleTransitFailures(db) {
	if (settled) return 0;
	if (!settling) settling = (async () => {
		try {
			const moved = await divertMatching(db, await loadActiveRules(db));
			settled = true;
			if (moved > 0) console.log(`[TRANSIT] ${moved} intervalos sacados de OEES y guardados como falla.`);
			return moved;
		} catch (err) {
			console.error("Transit failure settle failed:", err);
			return 0;
		} finally {
			settling = null;
		}
	})();
	return settling;
}
async function confirmFailureRule(db, { part, process, error }) {
	const PARTNUMBER = String(part || "").trim();
	const PROCESS = String(process || "").trim().toUpperCase();
	const ERROR = String(error || "").trim();
	const now = /* @__PURE__ */ new Date();
	await ensureFailureRules(db);
	await db.collection(RULES).updateOne({
		PARTNUMBER,
		PROCESS
	}, {
		$set: {
			ERROR,
			VERDICT: "FAILURE",
			ACTIVE: true,
			updatedAt: now
		},
		$setOnInsert: {
			createdAt: now,
			PARTNUMBER,
			PROCESS
		}
	}, { upsert: true });
	clearRuleCache();
	return divertMatching(db, (await loadActiveRules(db)).filter((rule) => rule.PARTNUMBER === PARTNUMBER && rule.PROCESS === PROCESS));
}
async function restoreToOees(db, part, process) {
	const docs = await db.collection(FAILURES).find({
		PARTNUMBER: part,
		PROCESS: process
	}).toArray();
	if (!docs.length) return 0;
	const ops = docs.filter((doc) => doc.IDENTIFIER).map((doc) => {
		const restored = withoutMongoId(doc);
		delete restored.RULE_ERROR;
		delete restored.MOVED_AT;
		return { updateOne: {
			filter: { IDENTIFIER: doc.IDENTIFIER },
			update: { $set: restored },
			upsert: true
		} };
	});
	await writeChunks(db.collection("OEES"), ops);
	await deleteIdentifiers(db.collection(FAILURES), docs.map((doc) => doc.IDENTIFIER).filter(Boolean));
	return docs.length;
}
async function acceptValidRule(db, { part, process }) {
	const PARTNUMBER = String(part || "").trim();
	const PROCESS = String(process || "").trim().toUpperCase();
	const now = /* @__PURE__ */ new Date();
	await restoreToOees(db, PARTNUMBER, PROCESS);
	await ensureFailureRules(db);
	await db.collection(RULES).updateOne({
		PARTNUMBER,
		PROCESS
	}, {
		$set: {
			VERDICT: "VALID",
			ACTIVE: true,
			ERROR: "",
			updatedAt: now
		},
		$setOnInsert: {
			createdAt: now,
			PARTNUMBER,
			PROCESS
		}
	}, { upsert: true });
	clearRuleCache();
	return 0;
}
async function reopenLevelReview(db, { part, process }) {
	const PARTNUMBER = String(part || "").trim();
	const PROCESS = String(process || "").trim().toUpperCase();
	await db.collection(RULES).updateOne({
		PARTNUMBER,
		PROCESS
	}, { $set: {
		ACTIVE: false,
		updatedAt: /* @__PURE__ */ new Date()
	} });
	clearRuleCache();
}
async function revokeFailureRule(db, { part, process }) {
	const PARTNUMBER = String(part || "").trim();
	const PROCESS = String(process || "").trim().toUpperCase();
	const restored = await restoreToOees(db, PARTNUMBER, PROCESS);
	await db.collection(RULES).updateOne({
		PARTNUMBER,
		PROCESS
	}, { $set: {
		ACTIVE: false,
		updatedAt: /* @__PURE__ */ new Date()
	} });
	clearRuleCache();
	return restored;
}
function dayKey(value) {
	if (!value) return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}
async function loadFailureReview(db) {
	const rules = await loadActiveRules(db);
	const active = ruleMap(rules);
	const [grouped, stored, inactive] = await Promise.all([
		db.collection("OEES").aggregate([{ $match: {
			PARTNUMBER: { $regex: /^[0-9]{8}$/ },
			PROCESS: { $nin: [
				null,
				"",
				"UNKNOWN"
			] }
		} }, { $group: {
			_id: {
				PARTNUMBER: "$PARTNUMBER",
				PROCESS: "$PROCESS",
				LEVEL: "$LEVEL",
				TYPE: "$TYPE",
				FAMILY: "$FAMILY"
			},
			qty: { $sum: "$PRODUCED" },
			intervals: { $sum: 1 },
			machines: { $addToSet: "$MACHINE" },
			latest: { $max: "$OEEDATE" }
		} }]).toArray(),
		db.collection(FAILURES).aggregate([{ $group: {
			_id: {
				PARTNUMBER: "$PARTNUMBER",
				PROCESS: "$PROCESS"
			},
			qty: { $sum: "$PRODUCED" },
			intervals: { $sum: 1 },
			latest: { $max: "$OEEDATE" }
		} }]).toArray(),
		db.collection(RULES).find({ ACTIVE: false }).toArray()
	]);
	const storedByKey = new Map(stored.map((row) => [ruleKey(row._id.PARTNUMBER, row._id.PROCESS), row]));
	const inactiveByKey = new Map(inactive.map((rule) => [ruleKey(rule.PARTNUMBER, rule.PROCESS), rule]));
	return {
		candidates: grouped.filter((row) => isFailureTransit({
			LEVEL: row._id.LEVEL,
			TYPE: row._id.TYPE,
			PROCESS: row._id.PROCESS
		}) && !active.has(ruleKey(row._id.PARTNUMBER, row._id.PROCESS))).map((row) => {
			const key = ruleKey(row._id.PARTNUMBER, row._id.PROCESS);
			const previous = inactiveByKey.get(key);
			return {
				part: row._id.PARTNUMBER,
				process: String(row._id.PROCESS || "").toUpperCase(),
				level: normalizeLevel(row._id.LEVEL).toLowerCase() || String(row._id.LEVEL || "").toLowerCase(),
				expected: expectedLevel(row._id.TYPE, row._id.PROCESS).toLowerCase(),
				family: row._id.FAMILY || "—",
				type: row._id.TYPE || "—",
				qty: Number(row.qty) || 0,
				intervals: row.intervals || 0,
				machines: (row.machines || []).filter(Boolean).sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
				latest: dayKey(row.latest),
				error: previous?.ERROR || ""
			};
		}).sort((a, b) => b.qty - a.qty || a.process.localeCompare(b.process) || a.part.localeCompare(b.part)),
		confirmed: rules.filter(isFailureVerdict).map((rule) => {
			const stats = storedByKey.get(ruleKey(rule.PARTNUMBER, rule.PROCESS));
			return {
				part: rule.PARTNUMBER,
				process: rule.PROCESS,
				error: rule.ERROR || "",
				qty: Number(stats?.qty) || 0,
				intervals: stats?.intervals || 0,
				latest: dayKey(stats?.latest)
			};
		}),
		accepted: rules.filter((rule) => rule.VERDICT === "VALID").map((rule) => {
			const key = ruleKey(rule.PARTNUMBER, rule.PROCESS);
			const rows = grouped.filter((row) => ruleKey(row._id.PARTNUMBER, row._id.PROCESS) === key);
			return {
				part: rule.PARTNUMBER,
				process: rule.PROCESS,
				qty: rows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0),
				intervals: rows.reduce((sum, row) => sum + (row.intervals || 0), 0),
				latest: rows.map((row) => dayKey(row.latest)).sort().at(-1) || ""
			};
		})
	};
}

export { ruleMap as a, revokeFailureRule as b, reopenLevelReview as c, divertMatching as d, acceptValidRule as e, confirmFailureRule as f, loadFailureReview as g, loadActiveRules as l, ruleKey as r, settleTransitFailures as s };
//# sourceMappingURL=transitFailures-CW0DmRZ4.js.map
