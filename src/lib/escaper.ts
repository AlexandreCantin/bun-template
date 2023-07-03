import { escapeHTML } from 'bun';

export function sanitizeAndTrim(value: string): string {
	if (!value) return value;
	return escapeHTML(value.trim());
}
