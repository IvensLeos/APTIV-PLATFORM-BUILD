//#region src/lib/log.js
/**
* Una línea para PM2 y la consola del navegador.
* [scope] evento | clave=valor clave=valor
* El Error va como segundo argumento de console.*, para que se imprima el stack.
*/
function logLine(scope, event, fields) {
	const parts = [];
	if (fields) for (const [key, value] of Object.entries(fields)) {
		if (value === void 0 || value === null || value === "") continue;
		const text = String(value);
		parts.push(/[\s|=]/.test(text) ? `${key}="${text.replace(/"/g, "")}"` : `${key}=${text}`);
	}
	return `[${scope}] ${event}${parts.length ? ` | ${parts.join(" ")}` : ""}`;
}

export { logLine as l };
//# sourceMappingURL=log-Dpp269sc.js.map
