import { ISendMail } from '$src/user-context/domain/interfaces';
import { Token } from '$src/user-context/domain/value-objects';

type Email = {
	to: string[];
	subject: string;
	html: string;
};

class RedisFaker {
	private memoryMap: Record<string, string> = {};

	async set(sessionId: string, token: Token) {
		this.memoryMap[sessionId] = token.getValue();
		return Promise.resolve();
	}

	public get(sessionId) {
		this.memoryMap[sessionId];
	}
}

export const REDIS_FAKER = new RedisFaker();
