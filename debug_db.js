const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debug() {
    const { data: products, error: pError } = await supabase.from('products').select('*');
    console.log("PRODUCTS:", products);
    if (pError) console.error("P ERROR:", pError);

    const { data: brands, error: bError } = await supabase.from('brands').select('*');
    console.log("BRANDS:", brands);
    if (bError) console.error("B ERROR:", bError);
}

debug();
