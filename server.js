const config = require('./config.js');
const app = require('./app.js');

app.listen(config.port, () => {
    console.log('API running on port ' + config.port);
});