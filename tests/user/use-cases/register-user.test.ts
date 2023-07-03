import { beforeAll, describe, expect, test } from 'bun:test';
import { disableConsoleOutput } from '../../utils/before-all';
import { createNewTestServer, doPost } from '../../utils/server';
import { EMAIL_FAKER } from '../../utils/faker/faker-email';

const BASE_INPUT = {
	username: 'username',
	fullname: 'fullname',
	email: 'email@example.com',
	password: 'password',
	locale: 'fr_FR',
};

describe('register-user use case', () => {
	beforeAll(() => {
		disableConsoleOutput();
	});

	test('sanitize fields', async () => {
		const app = await createNewTestServer();

		const expectedMessages = {
			username: 'REGISTER_USER__USERNAME__MIN',
			fullname: 'REGISTER_USER__FULLNAME__MIN',
			email: 'REGISTER_USER__EMAIL__REQUIRED',
			password: 'REGISTER_USER__PASSWORD__MIN',
			locale: 'REGISTER_USER__LOCALE__WRONG_VALUE',
		};

		const inputFields = Object.keys(BASE_INPUT);

		for (const field of inputFields) {
			const input = { ...BASE_INPUT };
			input[field] = '      ';

			const { statusCode, json } = await doPost(app, 'user/register', input);
			expect(statusCode).toBe(400);
			expect(json.error).toBe(expectedMessages[field]);
		}
	});

	test('missing fields', async () => {
		const app = await createNewTestServer();

		const inputFields = Object.keys(BASE_INPUT);

		for (const field of inputFields) {
			const input = { ...BASE_INPUT };
			delete input[field];

			const expectedMesage = `REGISTER_USER__${field.toUpperCase()}__REQUIRED`;
			const { statusCode, json } = await doPost(app, 'user/register', input);
			expect(statusCode).toBe(400);
			expect(json.error).toBe(expectedMesage);
		}
	});

	test('malformed email', async () => {
		const app = await createNewTestServer();

		const input = {
			...BASE_INPUT,
			email: 'wrong-email',
		};

		const { statusCode, json } = await doPost(app, 'user/register', input);
		expect(statusCode).toBe(400);
		expect(json.error).toBe('REGISTER_USER__EMAIL__WRONG_FORMAT');
	});

	test('too long email', async () => {
		const app = await createNewTestServer();

		const input = {
			...BASE_INPUT,
			email: `${'my_long_email'.repeat(20)}@example.com`,
		};

		const { statusCode, json } = await doPost(app, 'user/register', input);
		expect(statusCode).toBe(400);
		expect(json.error).toBe('REGISTER_USER__EMAIL__MAX');
	});

	test.only('send register email', async () => {
		const app = await createNewTestServer();

		const { statusCode, json } = await doPost(app, 'user/register', BASE_INPUT);
		expect(statusCode).toBe(204);

		const email = EMAIL_FAKER.getEmails()[0];
		expect(email.to).toEqual([BASE_INPUT.email]);
		expect(email.subject).toBe('Valider votre compte');
	});
});
