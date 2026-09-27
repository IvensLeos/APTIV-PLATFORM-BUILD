//#region src/lib/server/holidays.js
/**
* Consulta única de días festivos. La colección real es `HOLIDAYS` con
* documentos { key: 'HOLIDAYS', value: 'YYYY-MM-DD', description, updatedAt }.
*
* @param {import('mongodb').Db | null} db
* @param {string} isoDateStr - Fecha en formato 'YYYY-MM-DD'
* @returns {Promise<boolean>}
*/
async function isHoliday(db, isoDateStr) {
	if (!db || !isoDateStr) return false;
	return await db.collection("HOLIDAYS").findOne({
		key: "HOLIDAYS",
		value: isoDateStr
	}, { projection: { _id: 1 } }) !== null;
}

export { isHoliday as i };
//# sourceMappingURL=holidays-CLGlgZFg.js.map
