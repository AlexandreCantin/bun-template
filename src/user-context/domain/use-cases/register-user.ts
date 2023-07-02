import AppError from '$src/app-error';

import { AVAILABLE_LOCALES } from '$user-context/domain/const';
import { sanitizeAndTrim } from '$lib/escaper';
import { validate } from '$lib/fastest-validator-validate';
import { encryptPassword } from '$src/lib/encrypt';

import {
	ICreateValidationToken,
	IFetchUserByEmail,
	IFetchUserBySlug,
	IFetchUserByUsername,
	ISaveUser,
	ISendValidationUserMail,
} from '$user-context/domain/interfaces';

import { UserEntity, ValidateUserEmailData } from '$user-context/domain/entities';
import { EncryptedPassword, Locale } from '$user-context/domain/value-objects';
import { addDaysToToday } from '$src/lib/date';

// INPUT
export interface RegisterUserInput {
	readonly username: string;
	readonly fullname: string;
	readonly password: string;
	readonly email: string;
	readonly locale: string;
}

const registerUserInputValidator = {
	email: { type: 'email', min: 3, max: 200 },
	username: { type: 'string', min: 3, max: 200 },
	fullname: { type: 'string', min: 3, max: 200 },
	password: { type: 'string', min: 3, max: 200 },
	locale: { type: 'string', enum: Object.values(AVAILABLE_LOCALES) },
};

export type RegisterUserResponse = {
	success: boolean;
};

export class RegisterUserUseCase {
	private input: RegisterUserInput;
	private spi: IFetchUserByEmail & IFetchUserByUsername & ISaveUser & IFetchUserBySlug;
	private mailer: ISendValidationUserMail;
	private tokenService: ICreateValidationToken;

	constructor({
		input,
		spi,
		mailer,
		tokenService,
	}: {
		input: RegisterUserInput;
		spi: IFetchUserByEmail & IFetchUserByUsername & ISaveUser & IFetchUserBySlug;
		mailer: ISendValidationUserMail;
		tokenService: ICreateValidationToken;
	}) {
		this.input = input;
		this.spi = spi;
		this.mailer = mailer;
		this.tokenService = tokenService;
	}

	private sanitizeInput() {
		this.input = {
			username: sanitizeAndTrim(this.input.username),
			fullname: sanitizeAndTrim(this.input.fullname),
			password: sanitizeAndTrim(this.input.password),
			email: sanitizeAndTrim(this.input.email),
			locale: sanitizeAndTrim(this.input.locale),
		};
	}

	async sanitizeAndValidateInput(): Promise<AppError | undefined> {
		this.sanitizeInput();

		return validate({
			errorPrefix: 'REGISTER_USER',
			schema: registerUserInputValidator,
			data: this.input,
		});
	}

	async canAccess(): Promise<AppError | undefined> {
		return;
	}

	async process(): Promise<RegisterUserResponse | AppError> {
		// 1 - Check email not already used
		let user = await this.spi.fetchUserByEmail(this.input.email);
		if (user) {
			throw new AppError({
				visibleByUser: true,
				message: 'REGISTER_USER__EMAIL_ALREADY_EXISTS',
				httpCode: 400,
			});
		}

		// 2 - Check username not already used
		user = await this.spi.fetchUserByUsername(this.input.username);
		if (user) {
			throw new AppError({
				visibleByUser: true,
				message: 'REGISTER_USER__USERNAME_ALREADY_EXISTS',
				httpCode: 400,
			});
		}

		// 3 - Create slug for user

		// 4 - Encrypt password
		const encryptedPassword = await encryptPassword(this.input.password);

		// 5 - Save user
		const newUser = new UserEntity({
			username: this.input.username,
			fullname: this.input.fullname,
			slugFullname: this.input.fullname,
			encryptedPassword: new EncryptedPassword(encryptedPassword),
			email: this.input.email,
			locale: new Locale(this.input.locale),
		});
		const createdUser = await this.spi.saveUser(newUser);

		// 6 - Send validation mail
		const validationToken = this.tokenService.createValidationToken(
			new ValidateUserEmailData(createdUser.getUid(), addDaysToToday(10))
		);
		this.mailer.sendValidationUserMail({
			to: [newUser.getEmail()],
			token: validationToken,
		});

		// 6 - Return the result
		return { success: true };
	}
}
