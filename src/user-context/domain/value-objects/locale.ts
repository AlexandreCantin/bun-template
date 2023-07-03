import { AVAILABLE_LOCALES } from '../const';

export class Locale {
	private locale: AVAILABLE_LOCALES;

	constructor(locale: string) {
		if (locale === AVAILABLE_LOCALES.fr_FR.toString()) {
			this.locale = AVAILABLE_LOCALES.fr_FR;
			return;
		}

		throw new Error(`@Locale: Unknown locale => ${locale}`);
	}

	public getValue(): AVAILABLE_LOCALES {
		return this.locale;
	}

	public toString(): string {
		return this.locale.toString();
	}
}
