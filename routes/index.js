const express = require('express');
const router = express.Router();

//const { VerifyToken } = require('../middlewares');

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  }
  else {
    next();
  }
});

//Server Test API
router.get('/', (req, res) => {
  res.status(200);
  res.json({ status: 'success', message: 'API Server Running.' });
});


//Import APIs
router.use('/admins', require('./admins'));
router.use('/auth', require('./auth'));
router.use('/consumer', require('./consumer'));
router.use('/provider', require('./provider'));
router.use('/user', require('./user'));





//Global error handler
router.use((req, res)=>{
  res.status(500);
  res.json({ status: 'failed', error: 'Internal Server Error.' });
});

module.exports = router;