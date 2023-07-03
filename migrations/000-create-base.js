exports.up = async function (DB) {
	await DB`
		CREATE TABLE users (
			uid uuid DEFAULT uuid_generate_v4(),
			username VARCHAR(255) UNIQUE NOT NULL,
			fullname VARCHAR(255) NOT NULL,
			password VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			locale VARCHAR(15) NOT NULL,
			created_at TIMESTAMP NOT NULL,
			validated BOOLEAN NOT NULL DEFAULT FALSE,
			last_login TIMESTAMP,
			updated_at TIMESTAMP
		);
	`;
};

exports.down = async function (DB) {
	await DB`DROP TABLE users`;
};
