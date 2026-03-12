const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("WARNING: Supabase URL or Key is missing. Check .env or Render ENV vars.");
} else {
  console.log("Supabase connection initialized with URL:", supabaseUrl);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  if (!supabaseUrl || !supabaseKey) return;

  console.log("Supabase: Starting seeding process...");

  try {
    // 1. Seed Default Admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('username')
      .eq('username', 'admin')
      .maybeSingle();

    if (adminError) {
      console.error("Supabase Error (checking admin):", adminError.message);
    } else if (!adminData) {
      console.log("Supabase: Creating default admin user...");
      const hash = await bcrypt.hash('krushi123', 10);
      const { error: insertError } = await supabase
        .from('admins')
        .insert([{ username: 'admin', password: hash }]);
      
      if (insertError) {
        console.error("Supabase Error (creating admin):", insertError.message);
      } else {
        console.log("Supabase: Default admin account created (admin/krushi123).");
      }
    } else {
      console.log("Supabase: Admin user already exists.");
    }

    // 2. Seed Default Content
    const { count: contentCount, error: contentError } = await supabase
      .from('site_content')
      .select('*', { count: 'exact', head: true });
    
    if (contentError) {
      console.error("Supabase Error (checking content):", contentError.message);
    } else if (contentCount === 0) {
      console.log("Supabase: Seeding default site content...");
      const defaultContent = [
        { key: 'heroTitle', value: 'शेतकऱ्यांसाठी विश्वासार्ह कृषी सेवा आणि दर्जेदार उत्पादने' },
        { key: 'heroSubtitle', value: 'कृषि कांचन येथे नामांकित कंपन्यांची खते, कीटकनाशके, बुरशीनाशके, तणनाशके आणि पीक संरक्षणासाठी आवश्यक उपाय उपलब्ध आहेत.' },
        { key: 'aboutText', value: 'कृषि कांचन हे शेतकऱ्यांसाठी अस्सल कृषी औषधे, खते, कीटकनाशके आणि पीक संरक्षण उत्पादने उपलब्ध करून देणारे विश्वासार्ह केंद्र आहे. आम्ही नामांकित MNC ब्रँड्सची उत्पादने, योग्य माहिती आणि शेतकरी-केंद्रित सेवा देण्यावर भर देतो.' },
        { key: 'contactArea', value: 'सातारा, कोरेगाव आणि भिलार' },
        { key: 'contactMobile', value: '9420630236' },
        { key: 'contactEmail', value: 'Krushikanchan@gmail.com' }
      ];
      const { error: insertContentError } = await supabase.from('site_content').insert(defaultContent);
      if (insertContentError) console.error("Supabase Error (seeding content):", insertContentError.message);
    }

    // 3. Seed Products
    const { count: prodCount, error: prodError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (prodError) {
      console.error("Supabase Error (checking products):", prodError.message);
    } else if (prodCount === 0) {
      console.log("Supabase: Seeding default products...");
      const defaultProducts = [
        { name: 'खते', description: 'जमिनीची सुपीकता वाढवण्यासाठी आणि पिकांची जोमदार वाढीसाठी दर्जेदार खते.', image_path: 'images/FERT.jpg', category: 'FERTILIZER' },
        { name: 'कीटकनाशके', description: 'पिकांना हानी करणाऱ्या किडींवर प्रभावी नियंत्रण.', image_path: 'images/pest.jpg', category: 'PESTICIDE' },
        { name: 'बुरशीनाशके', description: 'बुरशीजन्य रोगांपासून पिकांचे संरक्षण करणारी उत्पादने.', image_path: 'images/gungi.jpg', category: 'FUNGICIDE' },
        { name: 'तणनाशके', description: 'तण नियंत्रणासाठी उपयुक्त आणि विश्वासार्ह पर्याय.', image_path: 'images/herb.jpg', category: 'HERBICIDE' },
        { name: 'बियाणे', description: 'उत्तम आणि भरघोस उत्पादनासाठी उच्च दर्जाचे और निवडक बियाणे.', image_path: 'images/seeds.jpg', category: 'SEED' }
      ];
      await supabase.from('products').insert(defaultProducts);
    }

    // 4. Seed Brands
    const { count: brandCount, error: brandError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });

    if (brandError) {
      console.error("Supabase Error (checking brands):", brandError.message);
    } else if (brandCount === 0) {
      console.log("Supabase: Seeding default brands...");
      const defaultBrands = [
        { name: 'BAYER', image_path: 'images/byer.svg', website_url: 'https://www.bayer.com/en/agriculture' },
        { name: 'FMC', image_path: 'images/fmc.webp', website_url: 'https://www.fmc.com/' },
        { name: 'SYNGENTA', image_path: 'images/Syngenta.png', website_url: 'https://www.syngenta.com/' },
        { name: 'PI INDUSTRIES', image_path: 'images/Pi industries.jpg', website_url: 'https://www.piindustries.com/' },
        { name: 'TATA RALLIS', image_path: 'images/rallis-india-limited-logo-png_seeklogo-384713 (1).png', website_url: 'https://www.rallis.com/' },
        { name: 'GODREJ AGROVET', image_path: 'images/download.jpeg', website_url: 'https://www.godrejagrovet.com/' },
        { name: 'DHANUKA', image_path: 'images/Dhanuja.webp', website_url: 'https://www.dhanuka.com/' },
        { name: 'AGRI SEARCH INDIA', image_path: 'images/agri search.svg', website_url: 'https://agrisearchindia.com/' },
        { name: 'COROMANDEL AGRICO PVT.LTD.', image_path: 'images/coromandel_international_limited_logo.jpeg', website_url: 'https://coromandel.biz/' },
        { name: 'IMMINENT', image_path: 'images/Imminent.png', website_url: 'https://www.imminentindia.com/' },
        { name: 'UPL', image_path: 'images/UPL_official_logo.svg.png', website_url: 'https://www.upl-ltd.com/' },
        { name: 'YARA INTERNATIONAL', image_path: 'images/yara-logo-shield-only-1.svg', website_url: 'https://www.yara.com/' }
      ];
      await supabase.from('brands').insert(defaultBrands);
    }
    
    console.log("Supabase: Seeding process completed.");

  } catch (err) {
    console.error("Supabase Seeding Exception:", err);
  }
}

seedData();

module.exports = supabase;
