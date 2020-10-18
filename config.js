const path = require('path')
const dotenv = require('dotenv').config()
const dotenvExample = require('dotenv').config({ path: path.resolve(process.cwd(), '.env.example') })

if (JSON.stringify(Object.keys(dotenv.parsed).sort()) !== JSON.stringify(Object.keys(dotenvExample.parsed).sort())) {
	throw Error('Missing values in .env. Please refer to .env.example')
}

module.exports = {

	port: process.env.PORT,
	mongodb: {
		connectionString: process.env.MONGO_CONNECTION_STRING,
	},
	secret: process.env.JWT_SECRET,
	publicImagePath: 'public/images/',
	tokenExpiryLimit: 86400,
	otpExpiryLimit: 1,
	plivo_authid: process.env.PLIVO_AUTHID,
	plivo_token: process.env.PLIVO_TOKEN,
	plivo_number: process.env.PLIVO_NUMBER,
	max_map_range: 10000, //10 KM
	environment: process.env.ENVIRONMENT,
}
