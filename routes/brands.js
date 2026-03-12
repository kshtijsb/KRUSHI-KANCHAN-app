const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../database');
const { verifyToken } = require('./auth');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'brand-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET all brands
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('brands')
            .select('*');

        if (error) return res.status(500).json({ error: error.message });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching brands.' });
    }
});

// POST a new brand (Protected)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    const { name, website_url } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required.' });
    }
    
    let image_path = '';
    if (req.file) {
        image_path = 'images/' + req.file.filename;
    }

    try {
        const { data, error } = await supabase
            .from('brands')
            .insert([{ name, image_path, website_url: website_url || '' }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Brand added successfully', id: data[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Server error adding brand.' });
    }
});

// DELETE a brand (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Brand deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting brand.' });
    }
});

module.exports = router;
