const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_krushikanchan_key_change_in_production';

// Login Endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    db.get("SELECT * FROM admins WHERE username = ?", [username], async (err, admin) => {
        if (err || !admin) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Compare password with hashed admin password
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });

        res.json({ message: 'Login successful', token });
    });
});

// Middleware to verify JWT Token
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    
    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, authData) => {
            if (err) {
                res.status(403).json({ error: 'Token is invalid or expired.' });
            } else {
                req.admin = authData;
                next();
            }
        });
    } else {
        res.status(401).json({ error: 'Authorization header is missing.' });
    }
};

// Route to verify if the current token is still valid
router.get('/verify', verifyToken, (req, res) => {
    res.json({ message: 'Token is valid.', admin: req.admin });
});

// Register New Admin Endpoint (Protected)
router.post('/register', verifyToken, (req, res) => {
    const { new_username, new_password } = req.body;

    if (!new_username || !new_password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    db.get("SELECT id FROM admins WHERE username = ?", [new_username], async (err, existingAdmin) => {
        if (existingAdmin) {
             return res.status(400).json({ error: 'Username already exists.' });
        }

        const hash = await bcrypt.hash(new_password, 10);
        db.run("INSERT INTO admins (username, password) VALUES (?, ?)", [new_username, hash], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create user.' });
            }
            res.status(201).json({ message: 'New admin created successfully.' });
        });
    });
});

module.exports = router;
module.exports.verifyToken = verifyToken;

