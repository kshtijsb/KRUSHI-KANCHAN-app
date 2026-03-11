const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('./auth');

// Get all content
router.get('/', (req, res) => {
    db.all('SELECT * FROM site_content', [], (err, rows) => {
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

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare('INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');

        let hasError = false;
        
        for (const [key, value] of Object.entries(updates)) {
             stmt.run(key, value, function(err) {
                 if (err) {
                     hasError = true;
                     console.error("Error updating content:", err);
                 }
             });
        }

        stmt.finalize((err) => {
            if (hasError || err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to update content.' });
            } else {
                db.run('COMMIT');
                res.json({ message: 'Content updated successfully.' });
            }
        });
    });
});

module.exports = router;
