import { b as private_env } from './shared-server-9-2j12mp.js';
import { r as requireRole } from './access-DAZySCgG.js';
import { i as isGzipFile, r as runMongoTool } from './mongoTool-C1sDCqG0.js';
import { f as fail } from './index-CRFfcpCQ.js';
import fs from 'fs';
import path from 'path';
import 'node:child_process';
import 'node:fs';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/backup/+page.server.js
var UPLOAD_LIMIT = 256 * 1024 * 1024;
/** @type {import('./$types').PageServerLoad} */
var load = async ({ locals }) => {
	requireRole(locals, ["ADMIN"]);
	return {};
};
/** @type {import('./$types').Actions} */
var actions = { restore: async ({ request, locals }) => {
	requireRole(locals, ["ADMIN"]);
	const formData = await request.formData();
	const backupFile = formData.get("backupFile");
	const confirm = formData.get("confirm")?.toString().trim().toUpperCase();
	if (!backupFile || !(backupFile instanceof File) || backupFile.size === 0) return fail(400, {
		success: false,
		error: "Choose a gzip archive."
	});
	if (backupFile.size > UPLOAD_LIMIT) return fail(400, {
		success: false,
		error: "That archive is larger than 256 MB."
	});
	if (confirm !== "RESTORE") return fail(400, {
		success: false,
		error: "Type RESTORE to replace the live database."
	});
	const tempDir = path.join(process.cwd(), "temp");
	const tempFilePath = path.join(tempDir, "restore_target.gz");
	try {
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
		const arrayBuffer = await backupFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		fs.writeFileSync(tempFilePath, buffer);
		if (!isGzipFile(tempFilePath)) {
			fs.unlinkSync(tempFilePath);
			return fail(400, {
				success: false,
				error: "That file is not a gzip archive from mongodump."
			});
		}
		console.log(`⏳ [RESTORE ENGINE]: Restoring ${buffer.length} bytes...`);
		await runMongoTool("mongorestore", [
			"--uri",
			private_env.MONGODB_URI,
			"--nsInclude",
			`${private_env.MONGODB_DB}.*`,
			`--archive=${tempFilePath}`,
			"--gzip",
			"--drop"
		]);
		console.log("✅ [RESTORE ENGINE]: Database override complete.");
		fs.unlinkSync(tempFilePath);
		return { success: true };
	} catch (error) {
		console.error("❌ [RESTORE ENGINE CRITICAL ERROR]:", error);
		if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
		return fail(500, {
			success: false,
			error: "Restore failed before the database was fully replaced."
		});
	}
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-CK1M4s4-.js')).default;
const server_id = "src/routes/admin/backup/+page.server.js";
const imports = ["_app/immutable/nodes/3.DU5i5Yg1.js","_app/immutable/chunks/DYrfkmbt.js","_app/immutable/chunks/-ZQlUM0a.js","_app/immutable/chunks/C1TVIs78.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/CeLV0ZdH.js","_app/immutable/chunks/BdEKbla0.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=3-9ZD9lkN1.js.map
