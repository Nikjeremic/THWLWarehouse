require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mongoose model
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
    cenaEUR: { type: Number, required: true },
    brojOtpremnice: { type: String },
    dobavljac: { type: String },
    napomena: { type: String }
  }],
  usageHistory: [{
    usageDate: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    napomena: { type: String }
  }]
});
const Material = mongoose.model('Material', materialSchema);

// API routes
app.get('/api/materials', async (req, res) => {
  const materials = await Material.find();
  res.json(materials);
});

app.post('/api/materials', async (req, res) => {
  const material = new Material(req.body);
  await material.save();
  res.status(201).json(material);
});

app.put('/api/materials/:id', async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(material);
});

app.delete('/api/materials/:id', async (req, res) => {
  await Material.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Ruta za dobijanje istorije uvoza
app.get('/api/materials/import-history', async (req, res) => {
  try {
    console.log('Pristup ruti za istoriju uvoza');
    const materials = await Material.find({}, 'material importHistory');
    console.log('Pronađeni materijali:', materials);

    if (!materials || materials.length === 0) {
      console.log('Nema materijala u bazi');
      return res.json([]);
    }

    const importHistory = materials.flatMap(material => {
      console.log('Obrada materijala:', material.material, 'Import history:', material.importHistory);
      return (material.importHistory || []).map(import_ => ({
        _id: import_._id || new mongoose.Types.ObjectId(),
        material: material.material,
        importDate: import_.importDate,
        quantity: import_.quantity
      }));
    }).sort((a, b) => new Date(b.importDate) - new Date(a.importDate));

    console.log('Procesirana istorija uvoza:', importHistory);
    res.json(importHistory);
  } catch (error) {
    console.error('Greška pri dobijanju istorije uvoza:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ažuriranje materijala
app.patch('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ako se ažurira stanje, dodaj u istoriju uvoza
    if (updates.stock !== undefined) {
      const material = await Material.findById(id);
      if (material) {
        const oldStock = material.stock;
        const newStock = Number(updates.stock);
        if (newStock > oldStock) {
          // Dodaj novi unos u istoriju uvoza
          const importEntry = {
            importDate: updates.lastImportDate || new Date(),
            quantity: newStock - oldStock
          };
          
          // Ažuriraj materijal sa novom istorijom uvoza
          updates.importHistory = [
            ...(material.importHistory || []),
            importEntry
          ];
          
          console.log('Dodavanje u istoriju uvoza:', {
            material: material.material,
            oldStock,
            newStock,
            importEntry
          });
        }
      }
    }

    const material = await Material.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    
    if (!material) {
      return res.status(404).json({ message: 'Materijal nije pronađen' });
    }
    
    res.json(material);
  } catch (error) {
    console.error('Greška pri ažuriranju materijala:', error);
    res.status(400).json({ message: error.message });
  }
});

// Nova ruta za uvoz materijala
app.post('/api/materials/:id/import', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, importDate, cenaEUR, brojOtpremnice, dobavljac, napomena } = req.body;
    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({ message: 'Količina je obavezna i mora biti broj.' });
    }
    if (!cenaEUR || isNaN(cenaEUR)) {
      return res.status(400).json({ message: 'Cena je obavezna i mora biti broj.' });
    }
    const update = {
      $inc: { stock: Number(quantity) },
      $push: { importHistory: {
        importDate: importDate || new Date(),
        quantity: Number(quantity),
        cenaEUR: Number(cenaEUR),
        brojOtpremnice: brojOtpremnice || '',
        dobavljac: dobavljac || '',
        napomena: napomena || ''
      } }
    };
    const material = await Material.findByIdAndUpdate(id, update, { new: true });
    if (!material) {
      return res.status(404).json({ message: 'Materijal nije pronađen' });
    }
    res.json(material);
  } catch (error) {
    console.error('Greška pri uvozu materijala:', error);
    res.status(500).json({ message: error.message });
  }
});

// Nova ruta za skidanje sa stanja
app.post('/api/materials/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, usageDate, napomena } = req.body;
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Količina je obavezna i mora biti pozitivan broj.' });
    }
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Materijal nije pronađen' });
    }
    if (material.stock < Number(quantity)) {
      return res.status(400).json({ message: 'Nema dovoljno materijala na stanju.' });
    }
    const update = {
      $inc: { stock: -Number(quantity) },
      $push: { usageHistory: {
        usageDate: usageDate || new Date(),
        quantity: Number(quantity),
        napomena: napomena || ''
      } }
    };
    const updatedMaterial = await Material.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedMaterial);
  } catch (error) {
    console.error('Greška pri skidanju sa stanja:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ruta za dobijanje istorije skidanja sa stanja
app.get('/api/materials/usage-history', async (req, res) => {
  try {
    const materials = await Material.find({}, 'material usageHistory');
    const usageHistory = materials.flatMap(material =>
      (material.usageHistory || []).map(usage => ({
        _id: usage._id || new mongoose.Types.ObjectId(),
        material: material.material,
        usageDate: usage.usageDate,
        quantity: usage.quantity,
        napomena: usage.napomena
      }))
    ).sort((a, b) => new Date(b.usageDate) - new Date(a.usageDate));
    res.json(usageHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint za izveštaj po periodu
app.get('/api/materials/report', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: 'Oba datuma (from, to) su obavezna.' });
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // uključuje ceo dan

    const materials = await Material.find({});
    const report = materials.map(mat => {
      // Početno stanje: stock - svi ulazi i svi izlazi posle fromDate
      const ulaziPosleFrom = (mat.importHistory || []).filter(u => new Date(u.importDate) > fromDate).reduce((sum, u) => sum + u.quantity, 0);
      const izlaziPosleFrom = (mat.usageHistory || []).filter(u => new Date(u.usageDate) > fromDate).reduce((sum, u) => sum + u.quantity, 0);
      const pocetnoStanje = mat.stock - ulaziPosleFrom + izlaziPosleFrom;

      // Ulaz u periodu
      const ulaz = (mat.importHistory || []).filter(u => new Date(u.importDate) >= fromDate && new Date(u.importDate) <= toDate).reduce((sum, u) => sum + u.quantity, 0);

      // Stanje na kraju perioda
      const ulaziPosleTo = (mat.importHistory || []).filter(u => new Date(u.importDate) > toDate).reduce((sum, u) => sum + u.quantity, 0);
      const izlaziPosleTo = (mat.usageHistory || []).filter(u => new Date(u.usageDate) > toDate).reduce((sum, u) => sum + u.quantity, 0);
      const stanje = mat.stock - ulaziPosleTo + izlaziPosleTo;

      // Potrošnja u periodu
      const potrosnja = pocetnoStanje + ulaz - stanje;

      // Poslednja cena u periodu
      const uvoziUPeriodu = (mat.importHistory || []).filter(u => new Date(u.importDate) >= fromDate && new Date(u.importDate) <= toDate);
      const poslednjaCena = uvoziUPeriodu.length > 0 ? uvoziUPeriodu[uvoziUPeriodu.length - 1].cenaEUR : '';

      // Potrošnja u EUR
      const potrosnjaEUR = poslednjaCena ? potrosnja * poslednjaCena : '';
      // Potrošnja za dva spinera (isto kao potrosnjaEUR)
      const potrosnja2sp = potrosnjaEUR;
      // Potrošnja za jedan spiner
      const potrosnja1sp = potrosnjaEUR ? potrosnjaEUR / 2 : '';

      return {
        material: mat.material,
        pocetnoStanje,
        ulaz,
        stanje,
        potrosnja,
        poslednjaCena,
        potrosnjaEUR,
        potrosnja2sp,
        potrosnja1sp
      };
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Brisanje unosa iz istorije uvoza
app.delete('/api/materials/:id/import/:importId', async (req, res) => {
  try {
    const { id, importId } = req.params;
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Materijal nije pronađen' });
    }
    material.importHistory = (material.importHistory || []).filter(u => String(u._id) !== String(importId));
    await material.save();
    res.json({ message: 'Unos uspešno obrisan.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log('Server running on port', process.env.PORT);
    });
  })
  .catch(err => console.error(err)); 