import AppError from '$src/app-error';

import { sanitizeAndTrim } from '$lib/escaper';
import { validate } from '$lib/fastest-validator-validate';
import { verifyPassword } from '$src/lib/encrypt';
import {
	ISessionToken,
	IFetchUserByEmail,
	IFetchUserByUsername,
	ISaveUser,
	IUpdateLastLoginDate,
	IFtechStorageSession,
} from '$user-context/domain/interfaces';
import { MyProfileInfos } from '$src/user-context/types';
import { SessionData } from '../entities';
import { addDaysToToday } from '$src/lib/date';
import { uniqId } from '$src/lib/uniq-id';

// INPUT
export interface LoginUserInput {
	readonly email: string;
	readonly password: string;
}

const loginUserInputValidator = {
	email: { type: 'email', min: 3, max: 250 },
	password: { type: 'string', min: 3, max: 255 },
};

export type LoginUserResponse = {
	user: MyProfileInfos;
	sessionId: string;
};

export class LoginUserUseCase {
	private input: LoginUserInput;
	private spi: IFetchUserByEmail & IFetchUserByUsername & ISaveUser & IUpdateLastLoginDate;
	private sessionStorageSpi: IFtechStorageSession;
	private tokenService: ISessionToken;

	constructor({
		input,
		spi,
		tokenService,
		sessionStorageSpi,
	}: {
		input: LoginUserInput;
		spi: IFetchUserByEmail & IFetchUserByUsername & ISaveUser & IUpdateLastLoginDate;
		tokenService: ISessionToken;
		sessionStorageSpi: IFtechStorageSession;
	}) {
		this.input = input;
		this.spi = spi;
		this.tokenService = tokenService;
		this.sessionStorageSpi = sessionStorageSpi;
	}

	private sanitizeInput() {
		this.input = {
			email: sanitizeAndTrim(this.input.email),
			password: sanitizeAndTrim(this.input.password),
		};
	}

	async sanitizeAndValidateInput(): Promise<AppError | undefined> {
		this.sanitizeInput();

		return validate({
			errorPrefix: 'LOGIN_USER',
			schema: loginUserInputValidator,
			data: this.input,
		});
	}

	async canAccess(): Promise<AppError | undefined> {
		return;
	}

	async process(): Promise<LoginUserResponse | AppError> {
		// 1 - Get user by email
		const user = await this.spi.fetchUserByEmail(this.input.email);
		if (!user) {
			throw new AppError({
				visibleByUser: true,
				message: 'LOGIN_USER__USER_NOT_FOUND',
				httpCode: 404,
			});
		}

		// 2 - Verify password
		const passwordOk = await verifyPassword(user.getEncryptedPassword().getValue(), this.input.password);
		if (!passwordOk) {
			throw new AppError({
				visibleByUser: true,
				message: 'LOGIN_USER__WRONG_PASSWORD',
				httpCode: 404,
			});
		}

		// 3 - Create token
		const token = await this.tokenService.createSessionToken(new SessionData(user.getUid(), addDaysToToday(90)));

		// 4 - Store token in external session storage
		const sessionId = uniqId(50);
		this.sessionStorageSpi.saveSessionInStore(sessionId, token);

		// 5 - Update last login date
		this.spi.updateLastLoginDate(user.getUid());

		// 6 - Return user profile
		return {
			user: user.getMyProfileInfos(),
			sessionId,
		};
	}
}
