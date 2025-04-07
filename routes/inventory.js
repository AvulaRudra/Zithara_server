const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const { db } = require('../index');

// Get all inventory items (admin only)
router.get('/', checkAuth, checkRole('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('inventory').get();
    const inventory = {};
    snapshot.forEach((doc) => {
      inventory[doc.id] = doc.data();
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Add new inventory item (admin only)
router.post('/', checkAuth, checkRole('admin'), async (req, res) => {
  const { id, stock, price, specs } = req.body;
  try {
    await db.collection('inventory').doc(id).set({ stock, price, specs });
    res.status(201).json({ message: `Item ${id} added` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update inventory item (admin only)
router.put('/:id', checkAuth, checkRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { stock, price, specs } = req.body;
  try {
    await db.collection('inventory').doc(id).update({ stock, price, specs });
    res.json({ message: `Item ${id} updated` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete inventory item (admin only)
router.delete('/:id', checkAuth, checkRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('inventory').doc(id).delete();
    res.json({ message: `Item ${id} deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;