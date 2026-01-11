const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all records for user
router.get('/', auth, (req, res) => {
    const db = readDB();
    const userRecords = db.records.filter(r => r.userId === req.user.id);
    res.json(userRecords);
});

// Add new record
router.post('/', auth, (req, res) => {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount) {
        return res.status(400).json({ error: 'Type and amount are required' });
    }

    const db = readDB();
    const newRecord = {
        id: uuidv4(),
        userId: req.user.id,
        type, // INFLOW or OUTFLOW
        amount: parseFloat(amount),
        category: category || 'General',
        description: description || '',
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    db.records.push(newRecord);
    writeDB(db);

    res.json(newRecord);
});

// Delete record
router.delete('/:id', auth, (req, res) => {
    const db = readDB();
    const index = db.records.findIndex(r => r.id === req.params.id && r.userId === req.user.id);

    if (index === -1) return res.status(404).json({ error: 'Record not found' });

    db.records.splice(index, 1);
    writeDB(db);

    res.json({ message: 'Record deleted' });
});

module.exports = router;
