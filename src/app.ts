import { Context, Hono, Next } from 'hono';
import { setCookie } from 'hono/cookie';
import { StatusCode } from 'hono/utils/http-status';
import { serveStatic } from 'hono/bun';
import { CookieOptions } from 'hono/utils/cookie';
import ip from 'ip';

import AppError from '$src/app-error';
import { Environment } from '$src/types';

import {
	LoginUserInput,
	LoginUserUseCase,
	ValidateUserInput,
	ValidateUserUseCase,
	RegisterUserInput,
	RegisterUserUseCase,
} from '$user-context/domain/use-cases';
import { UserContextIORedisAdapter, UserContextKyselyAdapter } from '$user-context/adapters';
import { UserContextTokenService } from '$user-context/services';
import { COOKIES, EXTRA_REQUEST_PARAMS } from './user-context/domain/const';
import { addDaysToToday } from './lib/date';
import { uniqId } from './lib/uniq-id';
import { MailService } from './user-context/services/mail-templating-service';
import { RateLimiterRedis } from 'rate-limiter-flexible';

// *** COOKIE CONFIGURATION
const cookieConfBase: CookieOptions = {
	domain: process.env.BACK_URL,
	httpOnly: process.env.ENV === 'production',
	path: '/',
	secure: process.env.ENV === 'production',
	sameSite: 'Lax',
};

export async function createNewServer({
	port,
	rateLimiter,
	environment,
	userContext,
}: {
	port: number;
	environment: Environment;
	rateLimiter: RateLimiterRedis;
	userContext: {
		sqlAdapter: UserContextKyselyAdapter;
		storeSessionAdapter: UserContextIORedisAdapter;
		tokenService: UserContextTokenService;
		mailService: MailService;
	};
}) {
	if (!environment || !Object.values(Environment).includes(environment)) {
		throw new Error(`@createNewServer => Wrong ENV given : '${environment}'`);
	}

	const app = new Hono();

	// *** MIDDLEWARES
	// Rate limiting
	app.use('*', async (c: Context, next: Next) => {
		if (c.req.path !== '/favicon.ico') {
			try {
				await rateLimiter.consume(ip.address(), 1);
			} catch (err) {
				return c.newResponse('TOO MANY REQUEST', 429);
			}
		}
		await next();
	});
	// Request id
	app.use('*', async (c: Context, next: Next) => {
		c.set(EXTRA_REQUEST_PARAMS.REQUEST_ID, uniqId());
		c.set(EXTRA_REQUEST_PARAMS.ENVIRONMENT, environment);
		await next();
	});
	// Error handling
	app.onError((err, context) =>
		throwHttpException(
			new AppError({
				visibleByUser: false,
				httpCode: 501,
				message: err.message,
				debugInfo: err.stack,
			}),
			context
		)
	);

	// *** ROUTES
	app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }));
	app.get('/', async (c) => {
		return c.json({ message: 'Hello World!' });
	});

	// Routes /user/
	app.post('/user/validate-account', async (c: Context) => {
		const body = await c.req.query();

		const validateUserUseCase = new ValidateUserUseCase({
			input: {
				token: body.token,
			} as ValidateUserInput,
			spi: userContext.sqlAdapter,
			tokenService: userContext.tokenService,
		});
		// Sanitize and validate input
		const validateInputError = await validateUserUseCase.sanitizeAndValidateInput();
		if (validateInputError) return throwHttpException(validateInputError, c);

		// Check access
		const validateAccessError = await validateUserUseCase.canAccess();
		if (validateAccessError) return throwHttpException(validateAccessError, c);

		// Process query
		const result = await validateUserUseCase.process();
		if (result instanceof AppError) return throwHttpException(result, c);

		return c.json(result);
	});

	app.post('/user/login', async (c: Context) => {
		const body = await c.req.json();

		const loginUseCase = new LoginUserUseCase({
			input: {
				email: body.email,
				password: body.password,
			} as LoginUserInput,
			spi: userContext.sqlAdapter,
			tokenService: userContext.tokenService,
			sessionStorageSpi: userContext.storeSessionAdapter,
		});
		// Sanitize and validate input
		const loginInputError = await loginUseCase.sanitizeAndValidateInput();
		if (loginInputError) return throwHttpException(loginInputError, c);

		// Check access
		const loginAccessError = await loginUseCase.canAccess();
		if (loginAccessError) return throwHttpException(loginAccessError, c);

		// Process query
		const result = await loginUseCase.process();
		if (result instanceof AppError) return throwHttpException(result, c);

		// Create cookie
		setCookie(c, COOKIES.SESSION_TOKEN, result.token, {
			...cookieConfBase,
			maxAge: addDaysToToday(90).getTime(),
		});

		return c.json(result.user);
	});

	app.post('/user/register', async (c: Context) => {
		const body = await c.req.json();

		// *** Register the user
		const registerUseCase = new RegisterUserUseCase({
			input: {
				password: body.password,
				username: body.username,
				fullname: body.fullname,
				email: body.email,
				locale: body.locale,
			} as RegisterUserInput,
			spi: userContext.sqlAdapter,
			mailer: userContext.mailService,
			tokenService: userContext.tokenService,
		});

		// Sanitize and validate input
		const inputError = await registerUseCase.sanitizeAndValidateInput();
		if (inputError) return throwHttpException(inputError, c);

		// Check access
		const accessError = await registerUseCase.canAccess();
		if (accessError) return throwHttpException(accessError, c);

		// Process query
		const registerResult = await registerUseCase.process();
		if (registerResult instanceof AppError) {
			return throwHttpException(registerResult, c);
		}

		return c.json({}, 204);
	});

	return app;
}

function throwHttpException(error: AppError, c: Context): Response {
	if (c.get(EXTRA_REQUEST_PARAMS.ENVIRONMENT) !== Environment.TESTING) {
		console.error(c.get(EXTRA_REQUEST_PARAMS.REQUEST_ID), error);
	}

	if (error.visibleByUser) {
		return c.json({ error: error.message }, +error.httpCode as StatusCode);
	}

	// TODO: Send error to Sentry here

	return c.json({ error: 'INTERNAL_SERVER_ERROR' }, 501);
}
