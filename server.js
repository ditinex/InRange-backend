const config = require('./config.js');
const server = require('./app.js');

server.listen(config.port, () => {
    console.log('API running on port ' + config.port);
});