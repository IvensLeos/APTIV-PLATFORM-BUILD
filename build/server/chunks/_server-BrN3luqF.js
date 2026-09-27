import { M as MONGODB_URI, a as MONGODB_DB } from './private-C3tFArXN.js';
import { r as requireRole } from './access-DhuzMuXb.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';

//#region src/routes/admin/backup/download/+server.js
var execAsync = promisify(exec);
/** @type {import('./$types').RequestHandler} */
var GET = async ({ locals }) => {
	requireRole(locals, ["ADMIN"]);
	const tempDir = path.join(process.cwd(), "temp");
	const tempFile = path.join(tempDir, "Backup_APTIV_PLATFORM.gz");
	try {
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
		await execAsync(`mongodump --uri="${MONGODB_URI}" --db="${MONGODB_DB}" --archive="${tempFile}" --gzip`);
		const fileBuffer = fs.readFileSync(tempFile);
		fs.unlinkSync(tempFile);
		return new Response(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/gzip",
				"Content-Disposition": `attachment; filename=Backup_APTIV_PLATFORM_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.gz`,
				"Cache-Control": "no-store"
			}
		});
	} catch (error) {
		console.error("❌ [BACKUP ENGINE ERROR]:", error);
		if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
		return new Response(JSON.stringify({
			success: false,
			error: "Fail executing backup binary dump"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};

export { GET };
//# sourceMappingURL=_server-BrN3luqF.js.map
