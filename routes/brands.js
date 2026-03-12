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
    cb(null, 'brand-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET all brands
router.get('/', (req, res) => {
    db.all("SELECT * FROM brands", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Server error fetching brands.' });
        res.json(rows);
    });
});

// POST a new brand (Protected)
router.post('/', verifyToken, upload.single('image'), (req, res) => {
    const { name, website_url } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required.' });
    }
    
    let image_path = '';
    if (req.file) {
        image_path = 'images/' + req.file.filename;
    }

    db.run("INSERT INTO brands (name, image_path, website_url) VALUES (?, ?, ?)",
        [name, image_path, website_url || ''],
        function(err) {
            if (err) return res.status(500).json({ error: 'Server error adding brand.' });
            res.status(201).json({ message: 'Brand added successfully', id: this.lastID });
        }
    );
});

// DELETE a brand (Protected)
router.delete('/:id', verifyToken, (req, res) => {
    db.run("DELETE FROM brands WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Server error deleting brand.' });
        res.json({ message: 'Brand deleted successfully' });
    });
});

module.exports = router;

