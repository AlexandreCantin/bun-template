import AppError from '$src/app-error';
import { UserEntity, SessionData, ValidateUserEmailData } from '$user-context/domain/entities';
import { Token } from '$user-context/domain/value-objects';

// SQL ADAPTER
export interface IFetchUserByEmail {
	fetchUserByEmail(email: string): Promise<UserEntity | undefined>;
}
export interface IFetchUserByUsername {
	fetchUserByUsername(username: string): Promise<UserEntity | undefined>;
}
export interface IFetchUserByUid {
	fetchUserByUid(id: string): Promise<UserEntity | undefined>;
}
export interface ISaveUser {
	saveUser(userEntity: UserEntity): Promise<UserEntity>;
}
export interface IValidateUser {
	validateUser(id: string): Promise<void>;
}
export interface IUpdateLastLoginDate {
	updateLastLoginDate(userUid: string): Promise<void>;
}

// Macaroon SERVICE
export interface ISessionToken {
	createSessionToken(data: SessionData): Token;
	decodeSessionToken(token: string): SessionData | AppError;
}
export interface ICreateUserValidationToken {
	createUserValidationToken(data: ValidateUserEmailData): Token;
	decodeUserValidationToken(token: string): ValidateUserEmailData | AppError;
}

// Mail ADAPTER
export interface ISendMail {
	sendMail(data: { to: string[]; subject: string; html: string }): Promise<void>;
}

// Mail SERVICE
export interface ISendValidationUserMail {
	sendValidationUserMail(data: { to: string[]; token: Token }): Promise<void>;
}

// Session SERVICE
export interface IFtechStorageSession {
	saveSessionInStore(sessionId: string, token: Token): Promise<void>;
	getSessionInStore(sessionId: string): Promise<Token>;
}
