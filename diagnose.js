const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function diagnose() {
    console.log("--- Diagnostics Started ---");
    console.log("Environment Variables:");
    console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "SET" : "MISSING");
    console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "SET" : "MISSING");
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.error("CRITICAL: Missing Supabase credentials in .env");
        return;
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    
    console.log("\n1. Testing Supabase Connection...");
    try {
        const { data, error } = await supabase.from('admins').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("Supabase Connection Error:", error.message);
            console.error("Error Code:", error.code);
            console.error("Error Details:", error.details);
            console.error("Error Hint:", error.hint);
        } else {
            console.log("Supabase Connection: SUCCESS");
            console.log("Admin Count:", data);
        }
    } catch (err) {
        console.error("Supabase Connection Exception:", err.message);
    }

    console.log("\n2. Checking for 'admin' user...");
    try {
        const { data, error } = await supabase.from('admins').select('*').eq('username', 'admin').maybeSingle();
        if (error) {
            console.error("Error fetching 'admin' user:", error.message);
        } else if (!data) {
            console.warn("WARNING: 'admin' user NOT found in database.");
        } else {
            console.log("SUCCESS: 'admin' user found.");
            console.log("Username:", data.username);
            console.log("Password Hash Length:", data.password ? data.password.length : "MISSING");
        }
    } catch (err) {
        console.error("Fetch User Exception:", err.message);
    }

    console.log("\n3. Testing Bcrypt...");
    try {
        const testHash = await bcrypt.hash('test', 10);
        const match = await bcrypt.compare('test', testHash);
        console.log("Bcrypt Test:", match ? "SUCCESS" : "FAILED");
    } catch (err) {
        console.error("Bcrypt Exception:", err.message);
    }

    console.log("\n--- Diagnostics Finished ---");
}

diagnose();
