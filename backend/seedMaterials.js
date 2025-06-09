require('dotenv').config();
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  material: String,
  dailyConsumptionKg: Number,
  stock: Number,
  unit: String
});
const Material = mongoose.model('Material', materialSchema);

const materials = [
  { material: 'Feldspat', dailyConsumptionKg: 532, stock: 10000 },
  { material: 'Soda', dailyConsumptionKg: 4560, stock: 20000 },
  { material: 'ETIBOR 48 (BORAX PENTAHDRATE) GRANULAR', dailyConsumptionKg: 2052, stock: 5000 },
  { material: 'Sand quartz / kvarcni pesak', dailyConsumptionKg: 10944, stock: 30000 },
  { material: 'Dolomit', dailyConsumptionKg: 4332, stock: 12000 },
  { material: 'Resin BOROFEN B-1658 / smola', dailyConsumptionKg: 1612, stock: 2000 },
  { material: 'BRB Silanil 919 / silan', dailyConsumptionKg: 7, stock: 100 },
  { material: 'BRB Siloen HJS / silicon emulsion', dailyConsumptionKg: 28, stock: 100 },
  { material: 'AMONIJUM SULFAT', dailyConsumptionKg: 21, stock: 100 },
  { material: '1005 GARO 217 S - anti - dust oil mullrex / protiv prašno ulje', dailyConsumptionKg: 112, stock: 500 },
  { material: 'Stretch hood film / streč hud folija', dailyConsumptionKg: 0.16, stock: 10, unit: 'rolni' },
  { material: 'Printed film 1400x0.07 / štampana folija', dailyConsumptionKg: 5, stock: 20, unit: 'rolni' },
  { material: 'Flah transparent film 1250x0.08 / transparentna folija', dailyConsumptionKg: 3, stock: 10, unit: 'rolni' },
  { material: 'Pallet', dailyConsumptionKg: 80, stock: 200 },
  { material: 'Phosphate', dailyConsumptionKg: 45.6, stock: 100 },
  { material: 'Kalcijum karbonat', dailyConsumptionKg: 10, stock: 50, unit: 'paketa' },
  { material: 'Lepak za robota 8791', dailyConsumptionKg: 30, stock: 100, unit: 'paketa' },
  { material: 'Lepak za rol up 8774', dailyConsumptionKg: 3000, stock: 5000, unit: 'komada' },
  { material: 'Municija za heftalicu', dailyConsumptionKg: 30, stock: 100, unit: 'komada' },
  { material: 'Selotejp trake za robota', dailyConsumptionKg: 2, stock: 10, unit: 'komada' },
  { material: 'Ribbon mala štampa', dailyConsumptionKg: 2, stock: 10, unit: 'komada' },
  { material: 'Ribbon velika štampa', dailyConsumptionKg: 80, stock: 200, unit: 'komada' },
  { material: 'Nalepnice za paletu/deklaracija', dailyConsumptionKg: 40, stock: 100, unit: 'komada' },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Material.deleteMany({});
    await Material.insertMany(materials);
    console.log('Baza je popunjena!');
    process.exit();
  }); 