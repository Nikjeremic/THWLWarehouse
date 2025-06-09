const express = require('express');
const router = express.Router();
const MaterialOrder = require('../models/MaterialOrder');
const Material = require('../models/Material');

// Get all material orders with material names
router.get('/', async (req, res) => {
  try {
    const orders = await MaterialOrder.find()
      .populate('materialId', 'material')
      .sort({ orderDate: -1 });
    
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      materialName: order.materialId.material,
      quantity: order.quantity,
      price: order.price,
      orderDate: order.orderDate
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new material order
router.post('/', async (req, res) => {
  const order = new MaterialOrder({
    materialId: req.body.materialId,
    quantity: req.body.quantity,
    price: req.body.price,
    orderDate: req.body.orderDate
  });

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE porudžbine
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await MaterialOrder.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Porudžbina nije pronađena' });
    }
    res.json({ message: 'Porudžbina obrisana' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT izmena porudžbine
router.put('/:id', async (req, res) => {
  const updates = {
    ...req.body,
    lastModifiedBy: req.user?.email || 'nepoznat',
    lastModifiedAt: new Date(),
  };
  try {
    const order = await MaterialOrder.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Porudžbina nije pronađena' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 