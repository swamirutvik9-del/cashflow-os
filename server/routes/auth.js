const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const db = readDB();
        const userExists = db.users.find(u => u.email === email);
        if (userExists) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            email,
            password: hashedPassword,
            name,
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        writeDB(db);

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'default_secret');
        res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
    } catch (e) {
        console.error("Signup Error:", e);
        res.status(500).json({ error: "Server error during signup" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = readDB();
        const user = db.users.find(u => u.email === email);

        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret');
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({ error: "Server error during login" });
    }
});

module.exports = router;
