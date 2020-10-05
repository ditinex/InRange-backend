const io = require("socket.io-client");

const socket = io("http://localhost:3001/chat", {
  reconnectionDelayMax: 10000,
});