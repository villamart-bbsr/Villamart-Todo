const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: String, // For demo only! Hash in production
  isAdmin: { type: Boolean, default: false }
});
module.exports = mongoose.model('User', userSchema);
