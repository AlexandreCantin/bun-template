import { ISendMail } from '$src/user-context/domain/interfaces';

type Email = {
	to: string[];
	subject: string;
	html: string;
};

class EmailFaker implements ISendMail {
	private emails: Email[] = [];

	async sendMail({ to, subject, html }: Email) {
		this.emails.push({ to, subject, html });
	}

	public getEmails() {
		return this.emails;
	}
}

export const EMAIL_FAKER = new EmailFaker();
