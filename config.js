const dotenv=require('dotenv').config()

console.log(process.env.example)

module.exports = {

	port:process.env.PORT,
	mongodb:{
		connectionString: process.env.MONGO_CONNECTION_STRING,
	},
	secret: 'MySecretKey',
	
}
