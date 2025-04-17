const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Get all users (Admin only)
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-googleId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all riders (Admin only)
router.get('/riders', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const riders = await User.find({ role: 'rider' }).select('-googleId');
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (Admin only)
router.patch('/users/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['customer', 'admin', 'rider'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    user.role = role;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve/disapprove user (Admin only)
router.patch('/users/:id/approval', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = isApproved;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get dashboard statistics (Admin only)
router.get('/dashboard', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalRiders = await User.countDocuments({ role: 'rider' });
    const pendingApprovals = await User.countDocuments({ isApproved: false });

    res.json({
      totalUsers,
      totalRiders,
      pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 