// SERVER CONFIG
export type ServerConfig = {
	port: number;
	environment: Environment;
};

export enum Environment {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
	TESTING = 'testing',
}
