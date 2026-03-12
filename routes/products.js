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
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET all products
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('products')
            .select('*');

        if (error) return res.status(500).json({ error: error.message });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching products.' });
    }
});

// POST a new product (Protected)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    const { name, description, category } = req.body;
    if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required.' });
    }
    
    let image_path = '';
    if (req.file) {
        image_path = 'images/' + req.file.filename;
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, description, image_path, category }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Product added successfully', id: data[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Server error adding product.' });
    }
});

// DELETE a product (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting product.' });
    }
});

module.exports = router;

