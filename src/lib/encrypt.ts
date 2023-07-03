import argon2 from '@node-rs/argon2';

// TODO: use bun-argon2 : https://bun.sh/blog/bun-v0.6.8#bun-password

// https://github.com/ranisalt/node-argon2/wiki/Options
export async function encryptPassword(password: string): Promise<string> {
	// FIXME : use `algorithm: Algorithm.Argon2i`
	return argon2.hash(password);
}

export async function verifyPassword(registeredPassword: string, passwordGiven: string): Promise<boolean> {
	return argon2.verify(registeredPassword, passwordGiven);
}
