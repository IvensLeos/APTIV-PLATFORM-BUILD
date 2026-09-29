import { b as private_env } from './shared-server-9-2j12mp.js';
import { r as requireRole } from './access-DhuzMuXb.js';
import { i as isGzipFile, r as runMongoTool } from './mongoTool-C1sDCqG0.js';
import fs from 'fs';
import path from 'path';
import './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';
import 'node:child_process';
import 'node:fs';

//#region src/routes/admin/backup/+page.server.js
/** @type {import('./$types').PageServerLoad} */
var load = async ({ locals }) => {
	requireRole(locals, ["ADMIN"]);
	return {};
};
/** @type {import('./$types').Actions} */
var actions = { restore: async ({ request, locals }) => {
	requireRole(locals, ["ADMIN"]);
	const backupFile = (await request.formData()).get("backupFile");
	if (!backupFile || !(backupFile instanceof File) || backupFile.size === 0) return {
		success: false,
		error: "NO VALID BACKUP FILE PROVIDED (.GZ REQUIRED)"
	};
	const tempDir = path.join(process.cwd(), "temp");
	const tempFilePath = path.join(tempDir, "restore_target.gz");
	try {
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
		const arrayBuffer = await backupFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		fs.writeFileSync(tempFilePath, buffer);
		if (!isGzipFile(tempFilePath)) return {
			success: false,
			error: "THE FILE IS NOT A GZIP ARCHIVE FROM MONGODUMP"
		};
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
		return {
			success: false,
			error: `RESTORE BINARY FAILURE: ${error.message || "Check database permissions"}`
		};
	}
} };

var _page_server = /*#__PURE__*/Object.freeze({
	__proto__: null,
	actions: actions,
	load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-u3H0tekc.js')).default;
const server_id = "src/routes/admin/backup/+page.server.js";
const imports = ["_app/immutable/nodes/3.vUcqIyJa.js","_app/immutable/chunks/DqEtdWn1.js","_app/immutable/chunks/Dtv3tcwd.js","_app/immutable/chunks/B0TJXvtN.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/FJ4qG_Bp.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=3-Cn6FrX3l.js.map
