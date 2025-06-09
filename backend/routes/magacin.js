const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware za proveru role
const checkRole = (roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Nemate dozvolu za pristup.' });
  }
};

// Lista svih korisnika (samo magacioner i admin)
router.get('/', checkRole(['magacioner', 'admin']), async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

module.exports = router; 