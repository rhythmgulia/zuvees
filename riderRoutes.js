const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Get rider's assigned orders
router.get('/my-orders', authenticateToken, authorizeRole('rider'), async (req, res) => {
  try {
    const orders = await Order.find({ rider: req.user._id })
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rider's delivery statistics
router.get('/statistics', authenticateToken, authorizeRole('rider'), async (req, res) => {
  try {
    const totalDelivered = await Order.countDocuments({
      rider: req.user._id,
      status: 'delivered'
    });

    const totalUndelivered = await Order.countDocuments({
      rider: req.user._id,
      status: 'undelivered'
    });

    const pendingDeliveries = await Order.countDocuments({
      rider: req.user._id,
      status: 'shipped'
    });

    res.json({
      totalDelivered,
      totalUndelivered,
      pendingDeliveries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update rider profile
router.patch('/profile', authenticateToken, authorizeRole('rider'), async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = req.user;

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 