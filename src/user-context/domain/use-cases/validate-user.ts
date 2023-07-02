import AppError from '$src/app-error';

import { sanitizeAndTrim } from '$lib/escaper';
import { validate } from '$lib/fastest-validator-validate';
import { ICreateValidationToken, IValidateUser, IFetchUserByUid } from '$user-context/domain/interfaces';

// INPUT
export interface ValidateUserInput {
	readonly token: string;
}

const validateUserInputValidator = {
	token: { type: 'string' },
};

export type ValidateUserResponse = {
	validated: boolean;
};

export class ValidateUserUseCase {
	private input: ValidateUserInput;
	private spi: IFetchUserByUid & IValidateUser;
	private tokenService: ICreateValidationToken;

	constructor({
		input,
		spi,
		tokenService,
	}: {
		input: ValidateUserInput;
		spi: IFetchUserByUid & IValidateUser;
		tokenService: ICreateValidationToken;
	}) {
		this.input = input;
		this.spi = spi;
		this.tokenService = tokenService;
	}

	private sanitizeInput() {
		this.input = {
			token: sanitizeAndTrim(this.input.token),
		};
	}

	async sanitizeAndValidateInput(): Promise<AppError | undefined> {
		this.sanitizeInput();

		return validate({
			errorPrefix: 'VALIDATE_USER',
			schema: validateUserInputValidator,
			data: this.input,
		});
	}

	async canAccess(): Promise<AppError | undefined> {
		return;
	}

	async process(): Promise<ValidateUserResponse | AppError> {
		// 1 - Decode token
		const validationData = this.tokenService.decodeValidationToken(this.input.token);
		if (validationData instanceof AppError) {
			return new AppError({
				visibleByUser: true,
				httpCode: 400,
				message: 'VALIDATE_USER__INVALID_TOKEN',
			});
		}

		// 2 - Get user by id
		const user = await this.spi.fetchUserByUid(validationData.getUserUid());
		if (!user) {
			throw new AppError({
				visibleByUser: true,
				message: 'VALIDATE_USER__USER_NOT_FOUND',
				httpCode: 404,
			});
		}

		// 3 - Mark account as validated
		await this.spi.validateUser(user.getUid());

		return {
			validated: true,
		};
	}
}
