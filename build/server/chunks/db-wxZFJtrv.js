import { b as private_env } from './shared-server-9-2j12mp.js';
import { MongoClient } from 'mongodb';

//#region src/lib/db.js
var client = null;
var db = null;
var connectDB = async () => {
	const MONGODB_URI = private_env.MONGODB_URI;
	const MONGODB_DB = private_env.MONGODB_DB;
	if (!MONGODB_URI || !MONGODB_DB) throw new Error("Faltan variables de entorno: MONGODB_URI o MONGODB_DB");
	try {
		if (!db) {
			client = new MongoClient(MONGODB_URI, {
				maxPoolSize: 50,
				minPoolSize: 10,
				maxIdleTimeMS: 3e4,
				connectTimeoutMS: 1e4,
				socketTimeoutMS: 45e3
			});
			await client.connect();
			db = client.db(MONGODB_DB);
			console.log(`🔌 MongoDB: Instancia Conectada Con Exito A "${MONGODB_DB}"`);
			const pm2Instance = process.env.NODE_APP_INSTANCE;
			if (pm2Instance === void 0 || pm2Instance === "0") {
				console.log("🛠️  [DB Maestro] Verificando E Indexando Colecciones...");
				await Promise.all([
					db.collection("OEES").createIndex({ IDENTIFIER: 1 }, {
						name: "unique_oee_identifier",
						unique: true
					}),
					db.collection("OEES").createIndex({
						MACHINE: 1,
						OEEDATE: 1,
						TIME_LOST: 1
					}, { name: "idx_oee_gap_audit" }),
					db.collection("STATIONS").createIndex({
						PROCESS: 1,
						MACHINE: 1
					}, { name: "idx_stations_process" }),
					db.collection("OEES").createIndex({
						MACHINE: 1,
						OEEDATE: 1,
						DATETIME: -1
					}, { name: "idx_oee_ui_latest" }),
					db.collection("HOLIDAYS").createIndex({
						key: 1,
						value: 1
					}, { name: "idx_holidays_key_value_lookup" })
				]);
				console.log("🚀 [DB Maestro] Índices De Alto Rendimiento Validados Exitosamente.");
			}
		}
		return db;
	} catch (error) {
		console.error("❌ MongoDB Connection Error:", error);
		throw error;
	}
};

export { connectDB as c };
//# sourceMappingURL=db-wxZFJtrv.js.map
