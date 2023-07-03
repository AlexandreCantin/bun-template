import { MyProfileInfos, UserInfos } from '$src/user-context/types';
import { EncryptedPassword, Locale } from '$user-context/domain/value-objects';

export class UserEntity {
	private uid: string;
	private username: string;
	private fullname: string;
	private encryptedPassword: EncryptedPassword;
	private email: string;
	private locale: Locale;
	private createdAt?: Date;
	private lastLogin?: Date;

	constructor({
		uid,
		username,
		fullname,
		encryptedPassword,
		email,
		locale,
		createdAt,
		lastLogin,
	}: {
		uid?: string | undefined;
		username: string | undefined;
		fullname: string;
		encryptedPassword: EncryptedPassword;
		email: string;
		locale: Locale;
		createdAt?: Date | undefined;
		lastLogin?: Date | undefined;
	}) {
		this.uid = uid;
		this.username = username;
		this.fullname = fullname;
		this.encryptedPassword = encryptedPassword;
		this.email = email;
		this.locale = locale;
		this.createdAt = createdAt;
		this.lastLogin = lastLogin;
	}

	public getUid(): string {
		return this.uid;
	}
	public getUsername(): string {
		return this.username;
	}
	public getFullname(): string {
		return this.fullname;
	}
	public getEncryptedPassword(): EncryptedPassword {
		return this.encryptedPassword;
	}
	public getEmail(): string {
		return this.email;
	}
	public getLocale(): Locale {
		return this.locale;
	}

	public getUserInfos(): UserInfos {
		return {
			username: this.username,
			fullname: this.fullname,
			email: this.email,
			locale: this.locale.toString(),
		};
	}

	public getMyProfileInfos(): MyProfileInfos {
		return {
			...this.getUserInfos(),
			createdAt: this.createdAt?.getTime().toString() || null,
			lastLogin: this.lastLogin?.getTime().toString() || null,
		};
	}
}
