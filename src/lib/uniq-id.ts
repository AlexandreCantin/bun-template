import hexoid from 'hexoid';

const hexoidFn: Record<number, () => string> = {};

export function uniqId(idLength = 25): string {
	if (!hexoidFn[idLength]) {
		hexoidFn[idLength] = hexoid(idLength);
	}
	return hexoidFn[idLength]();
}
