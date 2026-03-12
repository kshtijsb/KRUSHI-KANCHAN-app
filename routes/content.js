const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Get all content
router.get('/', (req, res) => {
    db.all("SELECT * FROM site_content", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch content.' });
        }
        
        // Convert array of {key, value} objects to a single object: { key1: val1, key2: val2 }
        const contentMap = {};
        rows.forEach(row => {
            contentMap[row.key] = row.value;
        });

        res.json(contentMap);
    });
});

// Update specific content (Protected Route)
router.post('/', verifyToken, (req, res) => {
    const updates = req.body; // Expecting { key1: val1, key2: val2 }

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No data provided for update.' });
    }

    const keys = Object.keys(updates);
    let completed = 0;
    let hasError = false;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        keys.forEach(key => {
            db.run("INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)", [key, updates[key]], (err) => {
                if (err) {
                    hasError = true;
                }
                completed++;
                if (completed === keys.length) {
                    if (hasError) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: 'Failed to update content.' });
                    } else {
                        db.run("COMMIT");
                        res.json({ message: 'Content updated successfully.' });
                    }
                }
            });
        });
    });
});

module.exports = router;

