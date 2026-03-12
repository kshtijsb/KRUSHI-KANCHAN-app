const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Admin users table
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        // Content table
        db.run(`CREATE TABLE IF NOT EXISTS site_content (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);

        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            image_path TEXT,
            category TEXT
        )`);

        // Brands table
        db.run(`CREATE TABLE IF NOT EXISTS brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            image_path TEXT,
            website_url TEXT
        )`, () => {
            seedData();
        });
    });
}

function seedData() {
    // Seed default admin
    db.get("SELECT * FROM admins WHERE username = 'admin'", (err, row) => {
        if (!row) {
            bcrypt.hash('krushi123', 10, (err, hash) => {
                db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['admin', hash]);
            });
        }
    });

    // Seed default content
    db.get("SELECT COUNT(*) as count FROM site_content", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO site_content (key, value) VALUES (?, ?)");
            stmt.run('heroTitle', 'शेतकऱ्यांसाठी विश्वासार्ह कृषी सेवा आणि दर्जेदार उत्पादने');
            stmt.run('heroSubtitle', 'कृषि कांचन येथे नामांकित कंपन्यांची खते, कीटकनाशके, बुरशीनाशके, तणनाशके आणि पीक संरक्षणासाठी आवश्यक उपाय उपलब्ध आहेत.');
            stmt.run('aboutText', 'कृषि कांचन हे शेतकऱ्यांसाठी अस्सल कृषी औषधे, खते, कीटकनाशके आणि पीक संरक्षण उत्पादने उपलब्ध करून देणारे विश्वासार्ह केंद्र आहे. आम्ही नामांकित MNC ब्रँड्सची उत्पादने, योग्य माहिती आणि शेतकरी-केंद्रित सेवा देण्यावर भर देतो.');
            stmt.run('contactArea', 'सातारा, कोरेगाव आणि भिलार');
            stmt.run('contactMobile', '9420630236');
            stmt.run('contactEmail', 'Krushikanchan@gmail.com');
            stmt.finalize();
        }
    });

    // Seed default products
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO products (name, description, image_path, category) VALUES (?, ?, ?, ?)");
            stmt.run('खते', 'जमिनीची सुपीकता वाढवण्यासाठी आणि पिकांची जोमदार वाढीसाठी दर्जेदार खते.', 'images/FERT.jpg', 'FERTILIZER');
            stmt.run('कीटकनाशके', 'पिकांना हानी करणाऱ्या किडींवर प्रभावी नियंत्रण.', 'images/pest.jpg', 'PESTICIDE');
            stmt.run('बुरशीनाशके', 'बुरशीजन्य रोगांपासून पिकांचे संरक्षण करणारी उत्पादने.', 'images/gungi.jpg', 'FUNGICIDE');
            stmt.run('तणनाशके', 'तण नियंत्रणासाठी उपयुक्त आणि विश्वासार्ह पर्याय.', 'images/herb.jpg', 'HERBICIDE');
            stmt.run('बियाणे', 'उत्तम आणि भरघोस उत्पादनासाठी उच्च दर्जाचे और निवडक बियाणे.', 'images/seeds.jpg', 'SEED');
            stmt.finalize();
        }
    });

    // Seed default brands
    db.get("SELECT COUNT(*) as count FROM brands", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO brands (name, image_path, website_url) VALUES (?, ?, ?)");
            stmt.run('BAYER', 'images/byer.svg', 'https://www.bayer.com/en/agriculture');
            stmt.run('FMC', 'images/fmc.webp', 'https://www.fmc.com/');
            stmt.run('SYNGENTA', 'images/Syngenta.png', 'https://www.syngenta.com/');
            stmt.run('PI INDUSTRIES', 'images/Pi industries.jpg', 'https://www.piindustries.com/');
            stmt.run('TATA RALLIS', 'images/rallis-india-limited-logo-png_seeklogo-384713 (1).png', 'https://www.rallis.com/');
            stmt.run('GODREJ AGROVET', 'images/download.jpeg', 'https://www.godrejagrovet.com/');
            stmt.run('DHANUKA', 'images/Dhanuja.webp', 'https://www.dhanuka.com/');
            stmt.run('AGRI SEARCH INDIA', 'images/agri search.svg', 'https://agrisearchindia.com/');
            stmt.run('COROMANDEL AGRICO PVT.LTD.', 'images/coromandel_international_limited_logo.jpeg', 'https://coromandel.biz/');
            stmt.run('IMMINENT', 'images/Imminent.png', 'https://www.imminentindia.com/');
            stmt.run('UPL', 'images/UPL_official_logo.svg.png', 'https://www.upl-ltd.com/');
            stmt.run('YARA INTERNATIONAL', 'images/yara-logo-shield-only-1.svg', 'https://www.yara.com/');
            stmt.finalize();
        }
    });
}

module.exports = db;
