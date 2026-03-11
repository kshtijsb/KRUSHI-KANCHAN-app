const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = 'super_secret_krushikanchan_key_change_in_production';

// Login Endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
        if (err || !admin) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Compare password with hashed admin password
        bcrypt.compare(password, admin.password, (err, isValid) => {
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            // Generate JWT Token
            const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });

            res.json({ message: 'Login successful', token });
        });
    });
});

// Middleware to verify JWT Token (can be exported for reuse)
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

    db.get('SELECT * FROM admins WHERE username = ?', [new_username], (err, admin) => {
        if (admin) {
             return res.status(400).json({ error: 'Username already exists.' });
        }

        bcrypt.hash(new_password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Error hashing password' });

            db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [new_username, hash], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user.' });
                }
                res.status(201).json({ message: 'New admin created successfully.' });
            });
        });
    });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
