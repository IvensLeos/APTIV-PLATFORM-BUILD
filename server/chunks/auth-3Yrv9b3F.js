import crypto from 'crypto';

//#region src/lib/auth.js
var ITERATIONS = 1e5;
var KEY_LEN = 64;
var DIGEST = "sha512";
var hashPassword = (password) => {
	const salt = crypto.randomBytes(16).toString("hex");
	return `${salt}:${crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex")}`;
};
var verifyPassword = (password, storedValue) => {
	const [salt, storedHash] = storedValue.split(":");
	return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex") === storedHash;
};

export { hashPassword as h, verifyPassword as v };
//# sourceMappingURL=auth-3Yrv9b3F.js.map
