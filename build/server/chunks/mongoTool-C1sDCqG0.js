import { spawn } from 'node:child_process';
import fs from 'node:fs';

//#region src/lib/server/mongoTool.js
/** mongodump / mongorestore sin shell, para que & y ? de la URI no partan el comando. */
function runMongoTool(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { windowsHide: true });
		let stderr = "";
		child.stderr.on("data", (chunk) => {
			stderr = (stderr + chunk.toString()).slice(-8e3);
		});
		child.on("error", (error) => {
			if (error.code === "ENOENT") {
				reject(/* @__PURE__ */ new Error(`${command} is not installed or not on PATH`));
				return;
			}
			reject(error);
		});
		child.on("close", (code) => {
			if (code === 0) resolve();
			else reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
		});
	});
}
function isGzipFile(filePath) {
	const fd = fs.openSync(filePath, "r");
	try {
		const magic = Buffer.alloc(2);
		return fs.readSync(fd, magic, 0, 2, 0) === 2 && magic[0] === 31 && magic[1] === 139;
	} finally {
		fs.closeSync(fd);
	}
}

export { isGzipFile as i, runMongoTool as r };
//# sourceMappingURL=mongoTool-C1sDCqG0.js.map
