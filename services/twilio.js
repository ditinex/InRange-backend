const Config = require('../config.js');
const client = require('twilio')(Config.twilio_sid, Config.twilio_token);

module.exports = async (number,message) => {
    return await client.messages
        .create({
            body: message,
            from: Config.twilio_number,
            to: number
        })
        .then(message => message);
}