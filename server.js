const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const productsRoutes = require('./routes/products');
const brandsRoutes = require('./routes/brands');
const leadsRoutes = require('./routes/leads');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/leads', leadsRoutes);

// Health Check / Debug Route
app.get('/debug/health', async (req, res) => {
    const config = {
        supabaseUrl: process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING',
        supabaseKey: process.env.SUPABASE_KEY ? 'PRESENT' : 'MISSING',
        jwtSecret: process.env.JWT_SECRET ? 'PRESENT' : 'MISSING'
    };
    
    try {
        const { data, error } = await db.from('admins').select('count', { count: 'exact', head: true });
        res.json({
            status: error ? 'ERROR' : 'CONNECTED',
            config,
            dbError: error ? error.message : null,
            adminCount: data || 0
        });
    } catch (err) {
        res.status(500).json({ status: 'EXCEPTION', config, error: err.message });
    }
});




// If an API route wasn't matched, send the index.html (except for /api routes)
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: `API route not found: ${req.path}` });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
