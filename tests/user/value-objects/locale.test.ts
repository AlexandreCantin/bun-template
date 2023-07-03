import { expect, describe, test } from 'bun:test';
import { Locale } from '$src/user-context/domain/value-objects';

describe('locale value object', () => {
	test('valid case', async () => {
		const fn = () => new Locale('fr_FR');
		expect(fn).not.toThrow('@Locale: Unknown locale => fr_FR');
	});

	test('error case', async () => {
		const fn = () => new Locale('INVALID');
		expect(fn).toThrow('@Locale: Unknown locale => INVALID');
	});
});
