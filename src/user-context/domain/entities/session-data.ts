export class SessionData {
	private sessionId: string;
	private expirationDate: Date;

	constructor(sessionId: string, expirationDate: Date) {
		this.sessionId = sessionId;
		this.expirationDate = expirationDate;
	}

	public getSessionId(): string {
		return this.sessionId;
	}
	public getExpirationDate(): Date {
		return this.expirationDate;
	}
}
