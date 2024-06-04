import crypto from 'crypto';

export function hashPassword(password: string) {
	return crypto.createHash('sha512').update(password).digest('hex');
}

export function verifyPassword(password: string, hashedPassword: string) {
	const hash = crypto.createHash('sha512').update(password).digest('hex');
	return hash === hashedPassword;
}
