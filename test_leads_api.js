const fetch = require('node-fetch');

async function testLeads() {
    try {
        // 1. Login to get token
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'krushi123' })
        });
        const { token } = await loginRes.json();
        console.log("Token obtained:", token ? "YES" : "NO");

        if (!token) return;

        // 2. Fetch leads
        const leadsRes = await fetch('http://localhost:3000/api/leads', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const leads = await leadsRes.json();
        console.log("Leads response:", leads);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testLeads();
