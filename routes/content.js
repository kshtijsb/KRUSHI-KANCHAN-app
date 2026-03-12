const express = require('express');
const router = express.Router();
const supabase = require('../database');
const { verifyToken } = require('./auth');

// Get all content
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('site_content')
            .select('*');

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch content.' });
        }
        
        // Convert array of {key, value} objects to a single object: { key1: val1, key2: val2 }
        const contentMap = {};
        rows.forEach(row => {
            contentMap[row.key] = row.value;
        });

        res.json(contentMap);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching content.' });
    }
});

// Update specific content (Protected Route)
router.post('/', verifyToken, async (req, res) => {
    const updates = req.body; // Expecting { key1: val1, key2: val2 }

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No data provided for update.' });
    }

    try {
        // Transform { key: val } to [{ key, value }] for Supabase upsert
        const upsertData = Object.entries(updates).map(([key, value]) => ({ key, value }));

        const { error } = await supabase
            .from('site_content')
            .upsert(upsertData, { onConflict: 'key' });

        if (error) {
            console.error("Supabase content update error:", error);
            return res.status(500).json({ error: 'Failed to update content.' });
        }

        res.json({ message: 'Content updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating content.' });
    }
});

module.exports = router;


