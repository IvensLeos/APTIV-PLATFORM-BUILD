import { b as private_env } from './shared-server-9-2j12mp.js';
import { l as logLine } from './log-Dpp269sc.js';
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
			const pm2Instance = process.env.NODE_APP_INSTANCE;
			const isPrimaryCluster = pm2Instance === void 0 || pm2Instance === "0";
			console.log(logLine("db", "conectado", {
				database: MONGODB_DB,
				instance: pm2Instance ?? "local",
				indexes: isPrimaryCluster ? "check" : "skip",
				pool: "10-50"
			}));
			if (isPrimaryCluster) {
				console.log(logLine("db", "indices", {
					instance: pm2Instance ?? "local",
					OEES: 4,
					STATIONS: 1,
					HOLIDAYS: 1
				}));
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
					db.collection("OEES").createIndex({
						OEEDATE: 1,
						PARTNUMBER: 1,
						MACHINE: 1
					}, { name: "idx_oee_taxonomy_gaps" }),
					db.collection("HOLIDAYS").createIndex({
						key: 1,
						value: 1
					}, { name: "idx_holidays_key_value_lookup" })
				]);
				console.log(logLine("db", "indices listos", {
					OEES: "unique_oee_identifier,idx_oee_gap_audit,idx_oee_ui_latest,idx_oee_taxonomy_gaps",
					STATIONS: "idx_stations_process",
					HOLIDAYS: "idx_holidays_key_value_lookup"
				}));
			}
		}
		return db;
	} catch (error) {
		console.error(logLine("db", db ? "indices fallidos" : "conexion fallida", {
			database: MONGODB_DB,
			instance: process.env.NODE_APP_INSTANCE ?? "local"
		}), error);
		throw error;
	}
};

export { connectDB as c };
//# sourceMappingURL=db-BvaPBFyI.js.map
