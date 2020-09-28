const Controllers = require('../controllers')
const Socket = Controllers.Socket

module.exports = (io) => {
    io.use((socket,next)=>{
        let token = socket.handshake.query.token;
        //console.log(token)
        //Import the middleware here
        next()
    })
    const realtimeTaskNamespace = io.of('/realtime-task');
    realtimeTaskNamespace.on('connection',socket=>Socket.ConnectionTest(socket,realtimeTaskNamespace))
};

