const Controllers = require('../controllers')
const Socket = Controllers.Socket

module.exports = (io) => {
    io.use((socket,next)=>{
        let token = socket.handshake.query.token;
        //console.log(token)
        //Import the middleware here
        next()
    })
    
    io.of('/realtime-task').on('connection',Socket.RealtimeTask);

    io.of('/realtime-provider').on('connection',Socket.RealtimeProvider);
    
    io.of('/chat').on('connection',(socket)=>Socket.Chat(socket,io));

    io.of('/realtime-inprogress-task').on('connection',Socket.RealtimeInprogressTask);

};

