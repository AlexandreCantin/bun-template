import { createNewServer } from '$src/app';
import { Environment } from '$src/types';
import postgres from 'postgres';
import Redis from 'ioredis';

import { RateLimiterRedis } from 'rate-limiter-flexible';
import { UserContextTokenService } from './user-context/services';
import { MailAdapter } from './user-context/adapters/mailer-adapter';
import { MailService } from './user-context/services/mail-templating-service';
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import { UserContextKyselyAdapter, Database } from './user-context/adapters';

const port = parseInt(process.env.PORT) || 3000;
const environment = process.env.ENV as Environment;

// *** DATABASE CONNECTION
const db = new Kysely<Database>({
	dialect: new PostgresJSDialect({
		options: {
			host: process.env.POSTGRESQL_ADDON_HOST,
			user: process.env.POSTGRESQL_ADDON_USER,
			password: process.env.POSTGRESQL_ADDON_PASSWORD,
			port: +process.env.POSTGRESQL_ADDON_PORT,
			database: process.env.POSTGRESQL_ADDON_DB,
		},
		postgres,
	}),
});

// *** MAIL ADAPTER
const mailAdapter = new MailAdapter();

// *** USER CONTEXT
const userContextSqlAdapter = new UserContextKyselyAdapter(db);
const userContextTokenService = new UserContextTokenService();
const userContextMailService = new MailService(mailAdapter);

// *** RATE LIMITING
// https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#different-limits-for-different-parts-of-application
const redis = new Redis({ enableOfflineQueue: false });
const rateLimiterRedis = new RateLimiterRedis({
	storeClient: redis,
	points: environment.toString() === 'production' ? 100 : +Infinity, // Number of points
	duration: 60, // Per 60 seconds
});

const app = await createNewServer({
	environment,
	port,
	rateLimiter: rateLimiterRedis,
	userContext: {
		sqlAdapter: userContextSqlAdapter,
		tokenService: userContextTokenService,
		mailService: userContextMailService,
	},
});

export default {
	port: port,
	fetch: app.fetch,
};
