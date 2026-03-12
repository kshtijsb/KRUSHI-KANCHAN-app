const express = require('express');
const router = express.Router();
const supabase = require('../database');
const { verifyToken } = require('./auth');

// POST a new lead (Public)
router.post('/', async (req, res) => {
    const { 
        name, phone, location, crop, 
        duration, area, 
        lead_type = 'FARMER', // FARMER or COMPANY
        contact_person, email, message 
    } = req.body;
    
    // Basic validation
    if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('leads')
            .insert([{ 
                name, phone, location, crop, 
                duration, area, 
                lead_type, contact_person, email, message 
            }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Inquiry submitted successfully', id: data[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Server error submitting inquiry.' });
    }
});

// GET all leads (Protected)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching leads.' });
    }
});

// UPDATE lead status (Protected)
router.patch('/:id', verifyToken, async (req, res) => {
    const { status } = req.body;
    try {
        const { data, error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', req.params.id)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Status updated', data: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating status.' });
    }
});

// DELETE a lead (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting lead.' });
    }
});

module.exports = router;
