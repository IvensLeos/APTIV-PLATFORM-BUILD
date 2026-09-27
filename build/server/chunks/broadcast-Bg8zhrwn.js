import { c as connectDB } from './db-W1d6-Une.js';

//#region src/lib/broadcast.js
/**
* @fileoverview Gestión centralizada (Singleton) para clientes SSE en tiempo real
* y estados activos de semáforos Andon en la planta.
*
* La memoria del proceso es una caché; la fuente de verdad de los paros activos
* es la colección `ANDON_ACTIVE` en MongoDB. Al arrancar el servidor se llama a
* `rehydrate()` para recuperar los paros abiertos y reanudar sus reemisiones
* respetando el tiempo ya transcurrido (sobrevive a deploys, crashes y reinicios).
*/
var COLLECTION = "ANDON_ACTIVE";
/** @type {Set<function(string): void>} Callbacks de envío de eventos SSE */
var clients = /* @__PURE__ */ new Set();
/** @type {Map<string, Object>} Paros activos. Llave: "maquina_estacion", Valor: payload del paro */
var activeDowntimes = /* @__PURE__ */ new Map();
/** @type {Map<string, NodeJS.Timeout>} Temporizadores de reemisión activos */
var escalationTimers = /* @__PURE__ */ new Map();
/**
* Promesa de la rehidratación en curso/completada. Los consumidores que necesitan
* el estado completo (SSE al conectar, load de captura) esperan `ready()` para no
* leer la caché vacía en los primeros milisegundos tras un reinicio.
* @type {Promise<number> | null}
*/
var rehydration = null;
/**
* Minutos hasta la siguiente reemisión según cuántas se han hecho:
* las dos primeras son a los 5 min, las siguientes cada 15 min
* (emisiones en +5, +10, +25, +40, +55... minutos desde la activación).
*/
var nextIntervalMinutes = (repetitionCount) => repetitionCount < 2 ? 5 : 15;
var buildStateKey = (data) => `${data.machine}_${data.station || "MAIN"}`;
async function persist(op) {
	try {
		const db = await connectDB();
		if (!db) return;
		await op(db.collection(COLLECTION));
	} catch (err) {
		console.error("❌ [ANDON] Error persistiendo estado en", COLLECTION, err.message);
	}
}
/** Payload serializable para guardar/reemitir (el _id de SCALATION_HISTORY se conserva como string). */
function toStorablePayload(data) {
	const { _id, ...rest } = data;
	return _id !== void 0 ? {
		...rest,
		_id: String(_id)
	} : rest;
}
function broadcastPayload(payload) {
	for (const sendEvent of [...clients]) try {
		sendEvent(payload);
	} catch {
		console.warn("Cliente inaccesible detectado. Eliminando suscripción.");
		clients.delete(sendEvent);
	}
}
/**
* Programa la siguiente reemisión de un paro activo y encadena las posteriores.
*
* @param {string} stateKey - Llave del paro (maquina_estacion).
* @param {number} repetitionCount - Reemisiones ya ejecutadas.
* @param {number} accumulatedTime - Minutos acumulados en el plan de reemisiones (5, 10, 25, ...).
* @param {number} [delayMs] - Retraso explícito para la próxima emisión (usado en la rehidratación).
*/
function scheduleNextReemission(stateKey, repetitionCount = 0, accumulatedTime = 0, delayMs) {
	const intervalMinutes = nextIntervalMinutes(repetitionCount);
	const waitMs = delayMs ?? intervalMinutes * 60 * 1e3;
	if (escalationTimers.has(stateKey)) clearTimeout(escalationTimers.get(stateKey));
	const timer = setTimeout(() => {
		const currentData = activeDowntimes.get(stateKey);
		if (!currentData) {
			escalationTimers.delete(stateKey);
			return;
		}
		try {
			const currentRepetition = repetitionCount + 1;
			const newAccumulated = accumulatedTime + intervalMinutes;
			const totalMinutesLost = (currentData.timeLost || 0) + newAccumulated;
			const nextLevel = currentRepetition <= 1 ? 1 : currentRepetition;
			broadcastPayload(JSON.stringify({
				...currentData,
				timeLost: totalMinutesLost,
				level: nextLevel
			}));
			persist((col) => col.updateOne({ _id: stateKey }, { $set: {
				repetitionCount: currentRepetition,
				lastEmissionAt: /* @__PURE__ */ new Date()
			} }));
			scheduleNextReemission(stateKey, currentRepetition, newAccumulated);
		} catch (err) {
			console.error("Error en el ciclo de reemisión:", err);
			escalationTimers.delete(stateKey);
		}
	}, waitMs);
	escalationTimers.set(stateKey, timer);
}
function clearReemission(stateKey) {
	if (escalationTimers.has(stateKey)) {
		clearTimeout(escalationTimers.get(stateKey));
		escalationTimers.delete(stateKey);
	}
}
var broadcastManager = {
	/**
	* Registra un cliente SSE y le envía de inmediato los paros activos.
	* @param {function(string): void} sendEvent
	* @returns {function(): void} Función de desuscripción.
	*/
	subscribe(sendEvent) {
		if (typeof sendEvent !== "function") return () => {};
		clients.add(sendEvent);
		for (const downtimeData of activeDowntimes.values()) try {
			sendEvent(JSON.stringify(downtimeData));
		} catch (err) {
			console.error("Error al enviar estado inicial al cliente:", err);
		}
		return () => clients.delete(sendEvent);
	},
	/**
	* Emite un evento Andon, actualiza la caché y la persistencia, y gestiona las reemisiones.
	* @param {Object} data
	* @param {string} data.machine
	* @param {string} [data.station]
	* @param {'ACTIVATE'|'DEACTIVATE'} data.action
	*/
	emit(data) {
		if (!data || !data.machine) return;
		const stateKey = buildStateKey(data);
		const payload = toStorablePayload(data);
		if (data.action === "ACTIVATE") {
			activeDowntimes.set(stateKey, payload);
			const startedAt = data.timestamp instanceof Date ? data.timestamp : /* @__PURE__ */ new Date();
			persist((col) => col.replaceOne({ _id: stateKey }, {
				_id: stateKey,
				payload,
				startedAt,
				repetitionCount: 0,
				lastEmissionAt: null
			}, { upsert: true }));
			scheduleNextReemission(stateKey, 0, 0);
		} else if (data.action === "DEACTIVATE") {
			activeDowntimes.delete(stateKey);
			clearReemission(stateKey);
			persist((col) => col.deleteOne({ _id: stateKey }));
		}
		let serialized;
		try {
			serialized = JSON.stringify(payload);
		} catch (err) {
			console.error("Error al serializar el payload de emisión:", err);
			return;
		}
		broadcastPayload(serialized);
	},
	/**
	* Devuelve el paro activo de una máquina (cualquier estación) o null.
	* @param {string} machineName
	*/
	getActiveState(machineName) {
		if (!machineName) return null;
		const prefix = `${machineName}_`;
		for (const [key, value] of activeDowntimes) if (key.startsWith(prefix)) return value;
		return null;
	},
	/**
	* Recupera desde MongoDB los paros abiertos y reanuda sus reemisiones.
	* Idempotente: la primera llamada arranca la carga; las siguientes devuelven la misma promesa.
	* @returns {Promise<number>} Número de paros rehidratados.
	*/
	rehydrate() {
		if (!rehydration) rehydration = runRehydration().catch((err) => {
			console.error("❌ [ANDON] No se pudo rehidratar el estado desde", COLLECTION, err.message);
			rehydration = null;
			return 0;
		});
		return rehydration;
	},
	/**
	* Resuelve cuando el estado en memoria ya refleja ANDON_ACTIVE.
	* @returns {Promise<number>}
	*/
	ready() {
		return this.rehydrate();
	}
};
/**
* Carga los paros abiertos desde MongoDB y reanuda sus reemisiones.
* Las reemisiones que debieron ocurrir mientras el servidor estaba caído se
* omiten (no se disparan en ráfaga); la siguiente se programa en su minuto real.
*/
async function runRehydration() {
	const db = await connectDB();
	if (!db) return 0;
	const docs = await db.collection(COLLECTION).find({}).toArray();
	const now = Date.now();
	for (const doc of docs) {
		const stateKey = doc._id;
		const payload = doc.payload;
		if (!payload || !payload.machine) continue;
		activeDowntimes.set(stateKey, payload);
		const elapsedMinutes = (now - new Date(doc.startedAt).getTime()) / 6e4;
		let repetitionCount = Number(doc.repetitionCount) || 0;
		let accumulated = 0;
		for (let i = 0; i < repetitionCount; i++) accumulated += nextIntervalMinutes(i);
		while (accumulated + nextIntervalMinutes(repetitionCount) <= elapsedMinutes) {
			accumulated += nextIntervalMinutes(repetitionCount);
			repetitionCount += 1;
		}
		const delayMs = Math.max(1e3, (accumulated + nextIntervalMinutes(repetitionCount) - elapsedMinutes) * 6e4);
		scheduleNextReemission(stateKey, repetitionCount, accumulated, delayMs);
	}
	if (docs.length > 0) console.log(`🔁 [ANDON] ${docs.length} paro(s) activo(s) rehidratado(s) desde ${COLLECTION}.`);
	return docs.length;
}

export { broadcastManager as b };
//# sourceMappingURL=broadcast-Bg8zhrwn.js.map
