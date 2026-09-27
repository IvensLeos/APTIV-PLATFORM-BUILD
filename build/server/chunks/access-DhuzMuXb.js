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
		prefix: "/api/scrape",
		roles: ["SUPERVISOR", "ADMIN"]
	},
	{
		prefix: "/api/planning",
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

export { ROLES as R, authorize as a, requireRole as r };
//# sourceMappingURL=access-DhuzMuXb.js.map
