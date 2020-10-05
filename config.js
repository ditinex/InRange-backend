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
	twilio_sid: process.env.TWILIO_SID,
	twilio_token: process.env.TWILIO_TOKEN,
	twilio_number: process.env.TWILIO_NUMBER,
	max_map_range: 10000 //10 KM
}
