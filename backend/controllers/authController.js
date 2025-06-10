const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, gender, company, role } = req.body;

    // Provera da li korisnik već postoji
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Korisnik sa ovim emailom već postoji' });
    }

    // Ako je admin, kreiraj novu kompaniju
    let companyId;
    if (role === 'admin') {
      const newCompany = await Company.create({
        name: company,
        address: req.body.address || '',
        city: req.body.city || '',
        country: req.body.country || '',
        phone: req.body.phone || '',
        email: req.body.companyEmail || '',
        vatNumber: req.body.vatNumber || ''
      });
      companyId = newCompany._id;
    } else {
      // Za ne-admin korisnike, proveri da li kompanija postoji
      const existingCompany = await Company.findOne({ name: company });
      if (!existingCompany) {
        return res.status(400).json({ message: 'Kompanija ne postoji' });
      }
      companyId = existingCompany._id;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Kreiraj korisnika
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender,
      company: companyId,
      adminCompany: role === 'admin' ? companyId : null,
      role
    });

    // Generiši JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: companyId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Greška pri registraciji' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Provera da li korisnik postoji
    const user = await User.findOne({ email }).populate('company');
    if (!user) {
      return res.status(400).json({ message: 'Pogrešan email ili lozinka' });
    }

    // Provera lozinke
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Pogrešan email ili lozinka' });
    }

    // Generiši JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Greška pri prijavljivanju' });
  }
}; 