const Config = require('../config.js');
const socketIOClient = require('socket.io-client')

const taskChange = socketIOClient('http://localhost:'+Config.port+'/realtime-task');
taskChange.on('connect', socket=>{ 
    console.log('Realtime DB Task Table helper Socket Connected.');
});

exports.taskChange = taskChange