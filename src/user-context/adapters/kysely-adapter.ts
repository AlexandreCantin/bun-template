import {
	IFetchUserByEmail,
	IFetchUserByUsername,
	ISaveUser,
	IFetchUserByUid,
	IUpdateLastLoginDate,
	IValidateUser,
} from '$user-context/domain/interfaces';
import { UserEntity } from '$user-context/domain/entities';
import { EncryptedPassword, Locale } from '$user-context/domain/value-objects';
import { Generated, Insertable, Kysely, Selectable, Updateable } from 'kysely';
import { AVAILABLE_LOCALES } from '../domain/const';

/** INTERFACES */
interface UserTable {
	uid: Generated<string>;
	username: string;
	fullname: string;
	password: string;
	email: string;
	locale: keyof typeof AVAILABLE_LOCALES;
	created_at: Date;
	validated: boolean;
	last_login: Date | null;
	updated_at: Date | null;
}
type UserRow = Selectable<UserTable>;
type InsertableUserRow = Insertable<UserTable>;
type UpdateableUserRow = Updateable<UserTable>;

export interface Database {
	users: UserTable;
}
/** END INTERFACE */

export class UserContextKyselyAdapter
	implements IFetchUserByEmail, IFetchUserByUsername, ISaveUser, IFetchUserByUid, IUpdateLastLoginDate, IValidateUser
{
	private db: Kysely<Database>;

	constructor(db: Kysely<Database> | undefined) {
		this.db = db;
	}
	async validateUser(userUid: string): Promise<void> {
		await this.db.updateTable('users').set({ validated: true }).where('uid', '=', userUid).execute();
	}

	private _convertLocale(locale: Locale): keyof typeof AVAILABLE_LOCALES {
		if (locale.toString() === AVAILABLE_LOCALES.fr_FR.toString()) {
			return 'fr_FR';
		}
		return 'fr_FR';
	}

	private _createUserFromRow(row: UserRow): UserEntity {
		return new UserEntity({
			uid: String(row.uid),
			username: row.username,
			fullname: row.fullname,
			encryptedPassword: new EncryptedPassword(row.password),
			email: row.email,
			locale: new Locale(row.locale),
			createdAt: row.created_at ? new Date(row.created_at) : undefined,
			lastLogin: row.last_login ? new Date(row.last_login) : undefined,
		});
	}

	async fetchUserByUid(uid: string): Promise<UserEntity | undefined> {
		const user = await this.db.selectFrom('users').where('uid', '=', uid).selectAll('users').executeTakeFirst();
		return user ? this._createUserFromRow(user) : undefined;
	}

	async fetchUserByEmail(email: string): Promise<UserEntity | undefined> {
		const user = await this.db.selectFrom('users').where('email', '=', email).selectAll('users').executeTakeFirst();
		return user ? this._createUserFromRow(user) : undefined;
	}

	async fetchUserByUsername(username: string): Promise<UserEntity | undefined> {
		const user = await this.db
			.selectFrom('users')
			.where('username', '=', username)
			.selectAll('users')
			.executeTakeFirst();

		return user ? this._createUserFromRow(user) : undefined;
	}

	async updateLastLoginDate(userUid: string): Promise<void> {
		await this.db.updateTable('users').set({ last_login: new Date() }).where('uid', '=', userUid).execute();
	}

	async saveUser(userEntity: UserEntity): Promise<UserEntity> {
		const id = await this.db
			.insertInto('users')
			.values({
				username: userEntity.getUsername(),
				fullname: userEntity.getFullname(),
				password: userEntity.getEncryptedPassword().getValue(),
				email: userEntity.getEmail(),
				locale: this._convertLocale(userEntity.getLocale()),
				created_at: new Date(),
			})
			.executeTakeFirstOrThrow();

		return this.fetchUserByUid(id.insertId.toString());
	}
}
