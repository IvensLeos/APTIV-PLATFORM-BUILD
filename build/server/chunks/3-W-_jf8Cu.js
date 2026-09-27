import { M as MONGODB_URI, a as MONGODB_DB } from './private-C3tFArXN.js';
import { r as requireRole } from './access-DhuzMuXb.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/backup/+page.server.js
var execAsync = promisify(exec);
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
		const command = `mongorestore --uri="${MONGODB_URI}" --nsInclude="${MONGODB_DB}.*" --archive="${tempFilePath}" --gzip --drop`;
		console.log("⏳ [RESTORE ENGINE]: Executing cluster data restoration...");
		await execAsync(command);
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
const component = async () => component_cache ??= (await import('./_page.svelte-CHG15VNo.js')).default;
const server_id = "src/routes/admin/backup/+page.server.js";
const imports = ["_app/immutable/nodes/3.dJhwrM_Q.js","_app/immutable/chunks/BMd-Mghi.js","_app/immutable/chunks/YSkIBHS_.js","_app/immutable/chunks/991LZ9Z8.js","_app/immutable/chunks/P24WUskH.js","_app/immutable/chunks/DK6yFgsL.js","_app/immutable/chunks/S-KyrcF8.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server as server, server_id, stylesheets };
//# sourceMappingURL=3-W-_jf8Cu.js.map
