import { AVAILABLE_LOCALES } from '$user-context/domain/const';
import { ISendMail, ISendValidationUserMail } from '$user-context/domain/interfaces';
import { Token } from '$user-context/domain/value-objects';

export class MailService implements ISendValidationUserMail {
	private mailAdapter: ISendMail;

	constructor(mailAdapter: ISendMail) {
		this.mailAdapter = mailAdapter;
	}

	async sendValidationUserMail({
		to,
		token,
		locale,
	}: {
		to: string[];
		token: Token;
		locale: AVAILABLE_LOCALES;
	}): Promise<void> {
		// FIXME: use FRONT_URL one day
		const url = `${process.env.BACK_URL}user/validate-account?token=${token.getValue()}`;

		this.mailAdapter.sendMail({
			to,
			subject: 'Valider votre compte',
			html: `<a href='${url}'>${url}</a>`,
		});
		return;
	}
}
