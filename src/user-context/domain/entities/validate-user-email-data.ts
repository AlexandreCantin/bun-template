export class ValidateUserEmailData {
	private userUid: string;
	private expirationDate: Date;

	constructor(userUid: string, expirationDate: Date) {
		this.userUid = userUid;
		this.expirationDate = expirationDate;
	}

	public getUserUid(): string {
		return this.userUid;
	}
	public getExpirationDate(): Date {
		return this.expirationDate;
	}
}
