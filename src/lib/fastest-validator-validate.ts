import AppError from '$src/app-error';
import Validator, { SyncCheckFunction } from 'fastest-validator';

const checkersCache: Record<string, SyncCheckFunction> = {};

export async function validate({
	errorPrefix,
	schema,
	data,
}: {
	errorPrefix: string;
	schema: Record<string, Record<string, string | number | string[]>>;
	data: object;
}): Promise<AppError | undefined> {
	// Compile and cache fastest-validator function (if needed)
	if (checkersCache[errorPrefix] === undefined) {
		checkersCache[errorPrefix] = new Validator().compile({
			...schema,
			$$strict: true,
		}) as SyncCheckFunction;
	}

	const checkFn: SyncCheckFunction = checkersCache[errorPrefix];
	const errors = checkFn(data);

	if (Array.isArray(errors)) {
		const error = errors[0];

		// Specific adaptation for fastest-validators
		if (error.type.endsWith('Min')) error.type = 'min';
		if (error.type.endsWith('Max')) error.type = 'max';
		if (error.type === 'email') error.type = 'wrong_format';
		if (error.type === 'emailEmpty') error.type = 'required';
		if (error.type === 'stringEnum') error.type = 'wrong_value';

		return new AppError({
			visibleByUser: true,
			httpCode: 400,
			message: `${errorPrefix}__${error.field.toUpperCase()}__${error.type.toUpperCase()}`,
		});
	}

	return undefined;
}
