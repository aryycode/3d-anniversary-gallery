const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'photos.json');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Support large base64 images
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }

    // Initialize photos.json if it doesn't exist
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({ photos: [] }, null, 2));
    }
}

// API Routes

// Get all photos
app.get('/api/photos', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const photosData = JSON.parse(data);
        res.json(photosData);
    } catch (error) {
        console.error('Error reading photos:', error);
        res.status(500).json({ error: 'Failed to load photos' });
    }
});

// Save photos
app.post('/api/photos', async (req, res) => {
    try {
        const photosData = req.body;
        await fs.writeFile(DATA_FILE, JSON.stringify(photosData, null, 2));
        res.json({ success: true, message: 'Photos saved successfully' });
    } catch (error) {
        console.error('Error saving photos:', error);
        res.status(500).json({ error: 'Failed to save photos' });
    }
});

// Delete a photo
app.delete('/api/photos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const photosData = JSON.parse(data);

        photosData.photos = photosData.photos.filter(photo => photo.id !== id);

        await fs.writeFile(DATA_FILE, JSON.stringify(photosData, null, 2));
        res.json({ success: true, message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

// Serve gallery page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    // Check for admin parameter
    const adminKey = req.query.admin;
    if (adminKey === 'aryy') {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.redirect('/');
    }
});

// Start server
async function startServer() {
    await ensureDataDirectory();
    app.listen(PORT, () => {
        console.log(`🎨 Anniversary Gallery Server running on http://localhost:${PORT}`);
        console.log(`📸 Gallery: http://localhost:${PORT}`);
        console.log(`⚙️  Admin: http://localhost:${PORT}/admin?admin=aryy`);
    });
}

startServer();
