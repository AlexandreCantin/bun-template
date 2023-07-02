export class EncryptedPassword {
	private encryptedPassword: string;

	constructor(encryptedPassword: string) {
		if (!encryptedPassword.startsWith('$argon2id$v=19$m=19456,t=2,p=1$')) {
			throw new Error('@EncryptedPassword: Not encrypted password');
		}
		this.encryptedPassword = encryptedPassword;
	}

	public getValue(): string {
		return this.encryptedPassword;
	}
}
