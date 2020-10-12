const Config = require('../config.js');
const plivo = require('plivo');
const client = new plivo.Client(Config.plivo_authid, Config.plivo_token);

module.exports = async (number,message) => {
    return await client.messages.create(
        Config.plivo_number,
        number,
        message
      ).then(message => message);
}