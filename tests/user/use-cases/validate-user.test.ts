import { beforeAll, describe, test, expect } from 'bun:test';
import { createNewTestServer, doPost } from '../../utils/server';
import { disableConsoleOutput } from '../../utils/before-all';

describe('validate-user use case', () => {
	beforeAll(() => {
		disableConsoleOutput();
	});

	test('should throw error if the token is invalid not found', async () => {
		const token = 'INVALID_TOKEN';
		const app = await createNewTestServer();

		const { statusCode, json } = await doPost(app, 'user/validate-account', { token });
		expect(statusCode).toBe(400);
		expect(json.error).toBe('VALIDATE_USER__TOKEN__REQUIRED');
	});
});
