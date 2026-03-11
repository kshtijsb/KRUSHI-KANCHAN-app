const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Admins Table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Website Content Table (Key-Value pair)
    db.run(`CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

    // Insert Default Admin if not exists
    db.get("SELECT * FROM admins WHERE username = 'admin'", (err, row) => {
        if (!row) {
            bcrypt.hash('krushi123', 10, (err, hash) => {
                db.run("INSERT INTO admins (username, password) VALUES ('admin', ?)", [hash]);
                console.log("Default admin account created (admin/krushi123).");
            });
        }
    });
    
    // Seed some default content if empty
    db.get("SELECT count(*) as count FROM site_content", (err, row) => {
        if (row && row.count === 0) {
             const defaultContent = [
                 ['heroTitle', 'शेतकऱ्यांसाठी विश्वासार्ह कृषी सेवा आणि दर्जेदार उत्पादने'],
                 ['heroSubtitle', 'कृषि कांचन येथे नामांकित कंपन्यांची खते, कीटकनाशके, बुरशीनाशके, तणनाशके आणि पीक संरक्षणासाठी आवश्यक उपाय उपलब्ध आहेत.'],
                 ['aboutText', 'कृषि कांचन हे शेतकऱ्यांसाठी अस्सल कृषी औषधे, खते, कीटकनाशके आणि पीक संरक्षण उत्पादने उपलब्ध करून देणारे विश्वासार्ह केंद्र आहे. आम्ही नामांकित MNC ब्रँड्सची उत्पादने, योग्य माहिती आणि शेतकरी-केंद्रित सेवा देण्यावर भर देतो.'],
                 ['contactArea', 'सातारा, कोरेगाव आणि भिलार'],
                 ['contactMobile', '9420630236'],
                 ['contactEmail', 'Krushikanchan@gmail.com']
             ];
             
             const stmt = db.prepare("INSERT INTO site_content (key, value) VALUES (?, ?)");
             defaultContent.forEach(item => stmt.run(item[0], item[1]));
             stmt.finalize();
             console.log("Default site content seeded.");
        }
    });

    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_path TEXT,
        category TEXT NOT NULL
    )`);

    // Brands Table
    db.run(`CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image_path TEXT,
        website_url TEXT
    )`);

    // Seed Products
    db.get("SELECT count(*) as count FROM products", (err, row) => {
        if (row && row.count === 0) {
            const defaultProducts = [
                ['खते', 'जमिनीची सुपीकता वाढवण्यासाठी आणि पिकांची जोमदार वाढीसाठी दर्जेदार खते.', 'images/FERT.jpg', 'FERTILIZER'],
                ['कीटकनाशके', 'पिकांना हानी करणाऱ्या किडींवर प्रभावी नियंत्रण.', 'images/pest.jpg', 'PESTICIDE'],
                ['बुरशीनाशके', 'बुरशीजन्य रोगांपासून पिकांचे संरक्षण करणारी उत्पादने.', 'images/gungi.jpg', 'FUNGICIDE'],
                ['तणनाशके', 'तण नियंत्रणासाठी उपयुक्त आणि विश्वासार्ह पर्याय.', 'images/herb.jpg', 'HERBICIDE'],
                ['बियाणे', 'उत्तम आणि भरघोस उत्पादनासाठी उच्च दर्जाचे आणि निवडक बियाणे.', 'images/seeds.jpg', 'SEED']
            ];
            const stmt = db.prepare("INSERT INTO products (name, description, image_path, category) VALUES (?, ?, ?, ?)");
            defaultProducts.forEach(p => stmt.run(p));
            stmt.finalize();
            console.log("Default products seeded.");
        }
    });

    // Seed Brands
    db.get("SELECT count(*) as count FROM brands", (err, row) => {
        if (row && row.count === 0) {
            const defaultBrands = [
                ['BAYER', 'images/byer.svg', 'https://www.bayer.com/en/agriculture'],
                ['FMC', 'images/fmc.webp', 'https://www.fmc.com/'],
                ['SYNGENTA', 'images/Syngenta.png', 'https://www.syngenta.com/'],
                ['PI INDUSTRIES', 'images/Pi industries.jpg', 'https://www.piindustries.com/'],
                ['TATA RALLIS', 'images/rallis-india-limited-logo-png_seeklogo-384713 (1).png', 'https://www.rallis.com/'],
                ['GODREJ AGROVET', 'images/download.jpeg', 'https://www.godrejagrovet.com/'],
                ['DHANUKA', 'images/Dhanuja.webp', 'https://www.dhanuka.com/'],
                ['AGRI SEARCH INDIA', 'images/agri search.svg', 'https://agrisearchindia.com/'],
                ['COROMANDEL AGRICO PVT.LTD.', 'images/coromandel_international_limited_logo.jpeg', 'https://coromandel.biz/'],
                ['IMMINENT', 'images/Imminent.png', 'https://www.imminentindia.com/'],
                ['UPL', 'images/UPL_official_logo.svg.png', 'https://www.upl-ltd.com/'],
                ['YARA INTERNATIONAL', 'images/yara-logo-shield-only-1.svg', 'https://www.yara.com/']
            ];
            const stmt = db.prepare("INSERT INTO brands (name, image_path, website_url) VALUES (?, ?, ?)");
            defaultBrands.forEach(b => stmt.run(b));
            stmt.finalize();
            console.log("Default brands seeded.");
        }
    });

});

module.exports = db;
