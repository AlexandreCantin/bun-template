import { EncryptedPassword } from '$src/user-context/domain/value-objects';
import { expect, describe, test } from 'bun:test';

describe('encrypted-password value object', () => {
	test('valid case', async () => {
		const fn = () =>
			new EncryptedPassword(
				'$argon2id$v=19$m=19456,t=2,p=1$Cov+jBCmFjt4qZE9eZbZ3Q$A2lvt88EOvqYd7qiBa6p9wmeKehK+J9QeNJzqe7L7itjSxiU1H8JsQ'
			);
		expect(fn).not.toThrow('@EncryptedPassword: Not encrypted password');
	});

	test('error case', async () => {
		const fn = () => new EncryptedPassword('INVALID');
		expect(fn).toThrow('@EncryptedPassword: Not encrypted password');
	});
});
