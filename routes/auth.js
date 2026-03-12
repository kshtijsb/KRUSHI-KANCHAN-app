const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_krushikanchan_key_change_in_production';

// Login Endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    try {
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (error || !admin) {
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
    } catch (err) {
        res.status(500).json({ error: 'Server error during login.' });
    }
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
router.post('/register', verifyToken, async (req, res) => {
    const { new_username, new_password } = req.body;

    if (!new_username || !new_password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    try {
        const { data: existingAdmin } = await supabase
            .from('admins')
            .select('id')
            .eq('username', new_username)
            .maybeSingle();

        if (existingAdmin) {
             return res.status(400).json({ error: 'Username already exists.' });
        }

        const hash = await bcrypt.hash(new_password, 10);
        const { error } = await supabase
            .from('admins')
            .insert([{ username: new_username, password: hash }]);

        if (error) {
            return res.status(500).json({ error: 'Failed to create user.' });
        }
        res.status(201).json({ message: 'New admin created successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

module.exports = router;
module.exports.verifyToken = verifyToken;

