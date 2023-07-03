import { slugify } from '$src/user-context/services/slugify';
import { describe, expect, test } from 'bun:test';

describe('slugify service', () => {
	test('should lower-case the text', () => {
		const text = 'Hello World';
		const result = slugify(text);
		expect(result).toBe('hello-world');
	});

	test('should trim the text', () => {
		const text = '  Hello World  ';
		const result = slugify(text);
		expect(result).toBe('hello-world');
	});

	test('should raise for empty text', () => {
		const text = '   ';
		expect(() => slugify(text)).toThrow('Empty slug');
	});
});
