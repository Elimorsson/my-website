
const express = require('express');
const router = express.Router();
const controllers = require('./../controllers/controllers');

router.get(`/say-something`, controllers.saySomthing);

module.exports = router;