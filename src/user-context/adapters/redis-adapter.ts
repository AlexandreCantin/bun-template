import { Redis } from 'ioredis';
import { IFtechStorageSession } from '../domain/interfaces';
import { Token } from '../domain/value-objects';

export class UserContextIORedisAdapter implements IFtechStorageSession {
	private redisClient: Redis;

	constructor(redisClient: Redis) {
		this.redisClient = redisClient;
	}

	async saveSessionInStore(sessionId: string, token: Token): Promise<void> {
		this.redisClient.set(sessionId, token.getValue());
	}

	async getSessionInStore(sessionId: string): Promise<Token> | undefined {
		// TODO: check if session exists
		const token = await this.redisClient.get(sessionId);
		if (token) return new Token(token);
	}
}
