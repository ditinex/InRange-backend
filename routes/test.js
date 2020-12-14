const express = require('express');
const Config = require('../config.js');
const router = express.Router();

const Controllers = require('../controllers')
const Test = Controllers.Test


router.get('/provider-change', Test.onProviderChange);



module.exports = router;