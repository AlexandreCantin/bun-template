/* eslint-disable @typescript-eslint/no-empty-function */

export function disableConsoleOutput() {
	// In order to have a clean test output, we disable console outputs
	console.log = () => {};
	console.error = () => {};
}
