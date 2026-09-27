import { M as MONGODB_URI, a as MONGODB_DB } from './private-C3tFArXN.js';
import { r as requireRole } from './access-DhuzMuXb.js';
import { r as runMongoTool, i as isGzipFile } from './mongoTool-C1sDCqG0.js';
import fs from 'fs';
import path from 'path';
import './index-CRFfcpCQ.js';
import './index-DBqjc0Yf.js';
import 'node:child_process';
import 'node:fs';

//#region src/routes/admin/backup/download/+server.js
/** @type {import('./$types').RequestHandler} */
var GET = async ({ locals }) => {
	requireRole(locals, ["ADMIN"]);
	const tempDir = path.join(process.cwd(), "temp");
	const tempFile = path.join(tempDir, "Backup_APTIV_PLATFORM.gz");
	try {
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
		await runMongoTool("mongodump", [
			"--uri",
			MONGODB_URI,
			"--db",
			MONGODB_DB,
			`--archive=${tempFile}`,
			"--gzip"
		]);
		if (!isGzipFile(tempFile)) throw new Error("mongodump did not write a gzip archive");
		const fileBuffer = fs.readFileSync(tempFile);
		fs.unlinkSync(tempFile);
		return new Response(fileBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/gzip",
				"Content-Length": String(fileBuffer.length),
				"Content-Disposition": `attachment; filename="Backup_APTIV_PLATFORM_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.gz"`,
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
//# sourceMappingURL=_server-C-87eLnc.js.map
