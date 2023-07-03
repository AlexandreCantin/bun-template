import { createNewServer } from '$src/app';
import { Environment } from '$src/types';
import { BASE_USER_CONTEXT } from './mock';

export async function createNewTestServer(userContext = BASE_USER_CONTEXT) {
	return createNewServer({
		port: 0,
		// @ts-ignore It's a dummy clone of the rate limiter
		rateLimiter: { consume: () => {} },
		environment: Environment.TESTING,
		userContext,
	});
}

export async function doPost(app: any, path: string, input: Record<string, unknown>) {
	const req = new Request(`http://localhost:3000/${path}`, {
		method: 'POST',
		body: JSON.stringify(input),
	});
	return _doRequest(app, req);
}

export async function doGet(app: any, path: string) {
	const req = new Request(`http://localhost:3000/${path}`);
	return _doRequest(app, req);
}

async function _doRequest(app: any, req: Request) {
	const response = await app.fetch(req);

	if (response.status === 404) {
		return {
			statusCode: response.status,
			json: {},
		};
	}

	return {
		statusCode: response.status,
		json: await response.json(),
	};
}
