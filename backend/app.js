const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const usersRouter = require('./routes/users');
const magacinRouter = require('./routes/magacin');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Middleware za parsiranje JWT tokena
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
    } catch (err) {
      // Token nije validan, ali ne blokiramo request
    }
  }
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/users', usersRouter);
app.use('/api/magacin', magacinRouter);

app.get('/', (req, res) => {
  res.send('THWL Warehouse backend radi.');
});

module.exports = app; 