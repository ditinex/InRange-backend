const Config = require('../config.js');
const socketIOClient = require('socket.io-client')

const taskChange = socketIOClient('http://localhost:'+Config.port+'/realtime-task');
taskChange.on('connect', socket=>{ 
    console.log('Realtime DB Task Table Helper Socket Connected.');
});

const providerChange = socketIOClient('http://localhost:'+Config.port+'/realtime-provider');
providerChange.on('connect', socket=>{ 
    console.log('Realtime DB Provider Table Helper Socket Connected.');
});

const inProgressTaskChange = socketIOClient('http://localhost:'+Config.port+'/realtime-inprogress-task');
inProgressTaskChange.on('connect', socket=>{ 
    console.log('Realtime DB Provider Table Helper Socket Connected.');
});

const notificationChange = socketIOClient('http://localhost:'+Config.port+'/realtime-notification');
inProgressTaskChange.on('connect', socket=>{ 
    console.log('Realtime DB Provider Table Helper Socket Connected.');
});

exports.taskChange = taskChange
exports.providerChange = providerChange
exports.inProgressTaskChange = inProgressTaskChange
exports.notificationChange = notificationChange