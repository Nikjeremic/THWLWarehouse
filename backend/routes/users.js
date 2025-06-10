const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware za proveru role
const checkRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    res.status(403).json({ message: 'Nemate dozvolu za pristup.' });
  }
};

// Lista svih korisnika (samo admin)
router.get('/', checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password').populate('company');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Greška pri učitavanju korisnika.' });
  }
});

// Kreiranje korisnika (admin, ili prvi admin bez autentikacije)
router.post('/', async (req, res, next) => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) {
    // Ako postoji bar jedan admin, koristi checkRole kao do sada
    return checkRole('admin')(req, res, next);
  }
  // Ako nema admina, dozvoli kreiranje bez autentikacije
  try {
    const { name, email, password, gender, company, role, theme, avatar, logo } = req.body;
    // Proveri da li kompanija postoji
    const companyDoc = await require('../models/Company').findOne({ name: company });
    if (!companyDoc) {
      return res.status(400).json({ message: 'Kompanija ne postoji.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, gender, company: companyDoc._id, role, theme, avatar, logo });
    await user.save();
    res.status(201).json({ message: 'Korisnik kreiran.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Pogrešan email ili lozinka.' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Pogrešan email ili lozinka.' });
  // Vraćamo JWT token sa podacima korisnika
  const { password: _, ...userData } = user.toObject();
  const token = jwt.sign(userData, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token, user: userData });
});

// Ažuriranje korisnika (admin ili sam korisnik)
router.put('/:id', async (req, res) => {
  const { password, company, ...rest } = req.body;
  let update = { ...rest };
  if (company) {
    const companyDoc = await require('../models/Company').findOne({ name: company });
    if (!companyDoc) {
      return res.status(400).json({ message: 'Kompanija ne postoji.' });
    }
    update.company = companyDoc._id;
  }
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('company');
  if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });
  const { password: _, ...userData } = user.toObject();
  res.json(userData);
});

// Brisanje korisnika (admin)
router.delete('/:id', checkRole('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Korisnik obrisan.' });
});

// Dohvati profil (sam korisnik)
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id, '-password');
  if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });
  res.json(user);
});

// Dohvati podatke o trenutno ulogovanom korisniku
router.get('/me', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Niste autorizovani.' });
  }
  const user = await User.findById(req.user.id, '-password').populate('company');
  if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });
  res.json(user);
});

module.exports = router; 