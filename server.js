const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// आपकी वेबसाइट (index.html) को दिखाने के लिए
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let linksDB = [];

// 1. Download API
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const apiUrl = 'https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    };

    try {
        const response = await fetch(apiUrl, options);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

// 2. Admin Login
app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: 'admin-123' });
    } else {
        res.status(401).json({ success: false });
    }
});

// 3. Links Management
app.get('/api/links', (req, res) => { res.json(linksDB); });
app.post('/api/links', (req, res) => {
    const { token, name, url } = req.body;
    if (token !== 'admin-123') return res.status(403).json({ error: 'Unauthorized' });
    linksDB.push({ name, url });
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
