const express = require('express');
const router = express.Router();

const Controllers = require('../controllers')
const Chat = Controllers.Chat

router.get('/getchatlist',Chat.GetChatList);
router.get('/unread-chat-count',Chat.UnseenChatCount);
router.post('/sendimage',Chat.SendImage);


module.exports = router;