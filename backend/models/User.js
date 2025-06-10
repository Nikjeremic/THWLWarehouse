const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  company: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true 
  },
  adminCompany: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  role: { type: String, enum: ['admin', 'magacioner', 'logistika', 'finansije', 'prodaja', 'odrzavanje'], default: 'logistika' },
  theme: { type: String, default: 'blue' },
  avatar: { type: String }, // base64 ili url
  logo: { type: String },   // base64 ili url
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 