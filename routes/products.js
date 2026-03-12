const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database');
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
router.get('/', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Server error fetching products.' });
        res.json(rows);
    });
});

// POST a new product (Protected)
router.post('/', verifyToken, upload.single('image'), (req, res) => {
    const { name, description, category } = req.body;
    if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required.' });
    }
    
    let image_path = '';
    if (req.file) {
        image_path = 'images/' + req.file.filename;
    }

    db.run("INSERT INTO products (name, description, image_path, category) VALUES (?, ?, ?, ?)",
        [name, description, image_path, category],
        function(err) {
            if (err) return res.status(500).json({ error: 'Server error adding product.' });
            res.status(201).json({ message: 'Product added successfully', id: this.lastID });
        }
    );
});

// DELETE a product (Protected)
router.delete('/:id', verifyToken, (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Server error deleting product.' });
        res.json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;

