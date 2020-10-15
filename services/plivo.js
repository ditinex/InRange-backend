const Config = require('../config.js');
const plivo = require('plivo');
let client = null
if(Config.plivo_authid)
  client = new plivo.Client(Config.plivo_authid, Config.plivo_token);

module.exports = async (number,message) => {
    return await client.messages.create(
        Config.plivo_number,
        number,
        message
      ).then(message => message);
}