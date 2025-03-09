// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  room: String,
  timestamp: Date,
});

module.exports = mongoose.model('Message', messageSchema);
