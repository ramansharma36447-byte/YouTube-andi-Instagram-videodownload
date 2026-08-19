const express = require('express');
const cors = require('cors');
const path = require('path');
// हमारी खुद की नई डाउनलोड मशीन 
const { ndown } = require('nayan-media-downloader');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let linksDB = [];

// PLAN B: Own Downloader Machine
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        let URL = await ndown(url);
        if (URL.status && URL.data && URL.data.length > 0) {
            let videoLink = URL.data[0].url;
            res.json({ url: videoLink });
        } else {
            res.status(500).json({ error: "Video not found or private link." });
        }
    } catch (error) {
        res.status(500).json({ error: "Server processing failed. Check URL." });
    }
});

// Admin Login
app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: 'admin-123' });
    } else {
        res.status(401).json({ success: false });
    }
});

// Links Management
app.get('/api/links', (req, res) => { res.json(linksDB); });
app.post('/api/links', (req, res) => {
    const { token, name, url } = req.body;
    if (token !== 'admin-123') return res.status(403).json({ error: 'Unauthorized' });
    linksDB.push({ name, url });
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
