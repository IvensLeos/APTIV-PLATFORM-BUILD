import { e as error } from './index-CRFfcpCQ.js';

//#region src/lib/server/access.js
/** Roles válidos del sistema (deben coincidir con el <select> de /admin/users). */
var ROLES = [
	"OPERATOR",
	"SUPERVISOR",
	"ADMIN"
];
/**
* Matriz de acceso por ruta. Se evalúa en orden y gana la primera regla cuyo
* prefijo coincida. Las rutas que no aparecen aquí son públicas (dashboards,
* captura, notifier de bocinas y sus APIs de soporte): los operadores de piso
* trabajan sin autenticarse. El rol OPERATOR existe solo como cuenta nominal
* sin acceso al panel administrativo.
*
* - roles: []      -> basta con estar autenticado (cualquier rol)
* - roles: [...]   -> requiere uno de los roles indicados
*/
var RULES = [
	{
		prefix: "/admin/users",
		roles: ["ADMIN"]
	},
	{
		prefix: "/admin/backup",
		roles: ["ADMIN"]
	},
	{
		prefix: "/admin",
		roles: ["SUPERVISOR", "ADMIN"]
	},
	{
		prefix: "/api/planning/upload",
		roles: ["ADMIN"]
	},
	{
		prefix: "/api/scrape",
		roles: ["SUPERVISOR", "ADMIN"]
	},
	{
		prefix: "/api/export",
		roles: ["SUPERVISOR", "ADMIN"]
	},
	{
		prefix: "/api/stats",
		roles: ["SUPERVISOR", "ADMIN"]
	}
];
var matchesPrefix = (pathname, prefix) => pathname === prefix || pathname.startsWith(prefix + "/");
/**
* Decide si un usuario puede acceder a una ruta.
* @param {string} pathname
* @param {{ role?: string } | null} user
* @returns {'ALLOW' | 'LOGIN' | 'FORBIDDEN'}
*/
function authorize(pathname, user) {
	const rule = RULES.find((r) => matchesPrefix(pathname, r.prefix));
	if (!rule) return "ALLOW";
	if (!user) return "LOGIN";
	if (rule.roles.length > 0 && !rule.roles.includes(user.role)) return "FORBIDDEN";
	return "ALLOW";
}
/**
* Guardia para usar dentro de load/actions/endpoints como segunda capa
* (defensa en profundidad) en operaciones destructivas.
* @param {{ user?: { role?: string } | null }} locals
* @param {string[]} allowedRoles
*/
function requireRole(locals, allowedRoles) {
	if (!locals?.user) throw error(401, "Authentication required");
	if (!allowedRoles.includes(locals.user.role)) throw error(403, "Insufficient permissions");
	return locals.user;
}
/** Ruta interna de la app. Rechaza URLs absolutas, protocol-relative y /login. */
function safeAppPath(value) {
	if (typeof value !== "string") return "";
	const path = value.trim();
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.includes("\n")) return "";
	let parsed;
	try {
		parsed = new URL(path, "http://aptiv.local");
	} catch {
		return "";
	}
	if (parsed.origin !== "http://aptiv.local") return "";
	if (parsed.pathname === "/login" || parsed.pathname.startsWith("/login/")) return "";
	return `${parsed.pathname}${parsed.search}`;
}
/** Página pública desde la que llegó el usuario, sin parámetros del modal. */
function publicPageFromReferer(origin, referer) {
	if (!referer) return "";
	try {
		const ref = new URL(referer);
		if (ref.origin !== origin) return "";
		if (authorize(ref.pathname, null) !== "ALLOW") return "";
		if (ref.pathname === "/login" || ref.pathname.startsWith("/login/")) return "";
		ref.searchParams.delete("login");
		ref.searchParams.delete("next");
		return `${ref.pathname}${ref.search}`;
	} catch {
		return "";
	}
}
/** Destino del modal: la página pública anterior, o inicio, con la ruta protegida en `next`. */
function loginOverlayPath(origin, referer, attempted) {
	const next = safeAppPath(attempted) || "/";
	const back = publicPageFromReferer(origin, referer) || "/";
	const target = new URL(back, origin);
	target.searchParams.set("login", "1");
	target.searchParams.set("next", next);
	return `${target.pathname}${target.search}`;
}

export { ROLES as R, authorize as a, loginOverlayPath as l, publicPageFromReferer as p, requireRole as r, safeAppPath as s };
//# sourceMappingURL=access-D6j5h6xx.js.map
