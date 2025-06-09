const mongoose = require('mongoose');

const materialOrderSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  lastModifiedBy: { type: String }, // email ili ime korisnika
  lastModifiedAt: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.model('MaterialOrder', materialOrderSchema); 