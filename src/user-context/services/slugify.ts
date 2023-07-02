import slug from 'slug';

export function slugify(text: string): string {
	const result = slug(text, { lower: true, trim: true, fallback: false });
	if (!result) {
		throw new Error('Empty slug');
	}
	return result;
}
