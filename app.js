const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileupload = require("express-fileupload");

const config = require('./config.js');
const routes = require('./routes');

//Init DB Connection
mongoose.connect(config.mongodb.connectionString, { auth:{authdb:"admin"}, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
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



app.listen(config.port, () => {
  console.log('API running on port '+config.port);
});

