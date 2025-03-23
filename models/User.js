const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
  },
  password: {
    type: String,
    required: true,
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // 'admin' or 'user'
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
