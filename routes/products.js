const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../database');
const { verifyToken } = require('./auth');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
        try {
            const fileExt = path.extname(req.file.originalname);
            const fileName = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}${fileExt}`;
            const filePath = `products/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error('Supabase Storage Error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload image to Supabase' });
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);
            
            image_path = publicUrl;
        } catch (err) {
            console.error('Upload catch error:', err);
            return res.status(500).json({ error: 'Internal upload error' });
        }
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

