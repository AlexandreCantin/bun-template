import { MacaroonsBuilder, MacaroonsVerifier, Macaroon, CaveatPacket } from 'macaroons.js';
import TimestampCaveatVerifier from 'macaroons.js/lib/verifier/TimestampCaveatVerifier';

import AppError from '$src/app-error';
import { ISessionToken, ICreateValidationToken } from '$user-context/domain/interfaces';
import { Token } from '$user-context/domain/value-objects';
import { SessionData } from '$user-context/domain/entities';
import { ValidateUserEmailData } from '../domain/entities/validate-user-email-data';

export class UserContextTokenService implements ISessionToken, ICreateValidationToken {
	private _decodeAndValidateToken(token: string, secret: string): Macaroon | AppError {
		const macaroon = MacaroonsBuilder.deserialize(token);
		const verifier = new MacaroonsVerifier(macaroon);

		macaroon.caveatPackets.forEach((caveat) => {
			const text = caveat.getValueAsText();
			if (text.startsWith('time < ')) {
				verifier.satisfyGeneral(TimestampCaveatVerifier);
			} else {
				verifier.satisfyExact(text);
			}
		});

		if (!verifier.isValid(secret)) {
			return new AppError({
				visibleByUser: true,
				httpCode: 400,
				message: 'INVALID_TOKEN',
			});
		}

		return macaroon;
	}

	private _extractCaveats(macaroon: Macaroon) {
		const res = {};
		macaroon.caveatPackets.map((caveat: CaveatPacket) => {
			const text = caveat.getValueAsText();
			const separator = text.includes('<') ? '<' : '=';

			const [key, value] = text.split(separator);
			res[key.trim()] = value.trim();
		});

		return res;
	}

	// SESSION TOKEN
	public createSessionToken(data: SessionData): Token {
		const macaroon = new MacaroonsBuilder(
			process.env.MACAROON_LOCATION,
			process.env.MACAROON_USER_SECRET,
			process.env.MACAROON_USER_IDENTIFIER
		)
			.add_first_party_caveat(`userId = ${data.getSessionId()}`)
			.add_first_party_caveat(`time < ${data.getExpirationDate().toISOString()}`)
			.getMacaroon();

		return new Token(macaroon.serialize());
	}

	public decodeSessionToken(token: string): SessionData | AppError {
		const macaroon = this._decodeAndValidateToken(token, process.env.MACAROON_USER_SECRET);
		const caveats: Record<string, string> = this._extractCaveats(macaroon);

		return new SessionData(caveats.userId, new Date(caveats.time));
	}

	// USER VALIDATION TOKEN
	public createValidationToken(data: ValidateUserEmailData): Token {
		const macaroon = new MacaroonsBuilder(
			process.env.MACAROON_LOCATION,
			process.env.MACAROON_VALIDATION_MAIL_SECRET,
			process.env.MACAROON_VALIDATION_MAIL_IDENTIFIER
		)
			.add_first_party_caveat(`userId = ${data.getUserUid()}`)
			.add_first_party_caveat(`time < ${data.getExpirationDate().toISOString()}`)
			.getMacaroon();

		return new Token(macaroon.serialize());
	}

	public decodeValidationToken(token: string): ValidateUserEmailData | AppError {
		const macaroon = this._decodeAndValidateToken(token, process.env.MACAROON_VALIDATION_MAIL_SECRET);
		const caveats: Record<string, string> = this._extractCaveats(macaroon);

		return new ValidateUserEmailData(caveats.userId, new Date(caveats.time));
	}
}
