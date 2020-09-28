const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileupload = require("express-fileupload");

const config = require('./config.js');
const routes = require('./routes');
const http = require('http');
const socket = require("socket.io");

//Init DB Connection
mongoose.connect(config.mongodb.connectionString, { auth:{authdb:"admin"}, useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true, useCreateIndex: true, useFindAndModify: false })
.then((e) => console.log('DB Connected.'))
.catch(error => { console.log(error) });




//Init app server
app = express()
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
app.use(bodyParser.raw({ limit: '50mb'}) );
app.use(fileupload({
	limits: { fileSize: 50 * 1024 * 1024 },
	debug: false,
}));
app.use(express.static('public'))


//Can add https / SSL cert here using https module

// importing routes
app.use('/', routes);
// Handle 404 not found 
app.use((req, res)=>{
  res.status(404);
  res.json({ status: 'failed', error: 'Router not found.' });
});

/*
 * Creating socket routes
 * Sockets are divided into namespace, used as router
 * The namespace / socket router are imported from router/socket.js
 * The middleware to verify token for all socket connection exists at middleware/index.js and imported to router/socket.js
 * All socket controllers exists in controller/SocketController.js
 */
const server = http.createServer(app)
const io = socket(server);
require('./routes/socket')(io);


module.exports = server;

