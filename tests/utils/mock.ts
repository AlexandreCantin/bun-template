/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { UserContextKyselyAdapter } from '$src/user-context/adapters';
import { SessionData, ValidateUserEmailData } from '$src/user-context/domain/entities';
import { Token } from '$src/user-context/domain/value-objects';
import { UserContextTokenService } from '$src/user-context/services';
import { MailService } from '$src/user-context/services/mail-templating-service';
import { EMAIL_FAKER } from './faker/faker-email';

export const BASE_SQL_ADAPTER = {
	fetchUserByUid: () => undefined,
	fetchUserByEmail: () => undefined,
	fetchUserByUsername: () => undefined,
	fetchUserBySlug: () => undefined,
	validateUser: () => undefined,
	updateLastLoginDate: () => undefined,
	saveUser: (user) => user,
} as unknown as UserContextKyselyAdapter;

export const BASE_TOKEN_SERVICE = {
	createSessionToken: (_data: SessionData) => new Token('TEST_TOKEN'),
	decodeSessionToken: (_token: Token) => new SessionData('12', new Date()),
	createValidationToken: (_data: ValidateUserEmailData) => new Token('TEST_TOKEN'),
	decodeValidationToken: (_token: string) => new ValidateUserEmailData('12', new Date()),
} as unknown as UserContextTokenService;

export const BASE_USER_CONTEXT = {
	sqlAdapter: BASE_SQL_ADAPTER,
	tokenService: BASE_TOKEN_SERVICE,
	mailService: new MailService(EMAIL_FAKER),
};
