const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  material: { type: String, required: true },
  dailyConsumptionKg: { type: Number, required: true },
  stock: { type: Number, required: true },
  unit: { type: String },
  supplier: { type: String },
  originCountry: { type: String },
  paymentTerms: { type: String },
  importHistory: [{
    importDate: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    cenaEUR: { type: Number },
    brojOtpremnice: { type: String },
    dobavljac: { type: String },
    napomena: { type: String }
  }],
  usageHistory: [{
    usageDate: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    napomena: { type: String }
  }],
  lastModifiedBy: { type: String },
  lastModifiedAt: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema); 