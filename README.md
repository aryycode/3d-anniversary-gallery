# 🎨 3D Anniversary Gallery

A beautiful 3D photo gallery with Node.js backend, Express server, and Three.js 3D visualization.

## ✨ Features

- 🎭 **3D Photo Gallery** with Three.js and orbit controls
- 💖 **Romantic Background** with floating hearts and twinkling stars
- 📱 **Touch & Swipe Gestures** for mobile support
- 🔄 **Smooth Orbit Camera** with natural perspective
- 💾 **Server-Side Storage** using JSON files
- 🖼️ **Automatic Image Compression** to save space
- 🔒 **Protected Admin Panel** with URL-based authentication
- 🐳 **Docker Support** for easy deployment

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

Access the gallery at: http://localhost:3000

### Option 2: Using Node.js

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Gallery: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin?admin=aryy

## ⚙️ Configuration

### Port Configuration

You can customize the port via environment variables:

#### Method 1: Using .env file (Recommended)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your desired port:
   ```env
   HOST_PORT=8080    # Port on your host machine
   PORT=3000         # Port inside container (usually keep as 3000)
   ```

3. Start with Docker Compose:
   ```bash
   docker-compose up -d
   ```
   Access at: http://localhost:8080

#### Method 2: Command-line override

**Docker Compose:**
```bash
# Run on port 8080
HOST_PORT=8080 docker-compose up -d

# Or set both ports
HOST_PORT=8080 PORT=8080 docker-compose up -d
```

**Node.js directly:**
```bash
# Run on port 8080
PORT=8080 npm start
```

**Docker run:**
```bash
# Build image
docker build -t anniversary-gallery .

# Run on custom port
docker run -d -p 8080:3000 -e PORT=3000 -v $(pwd)/data:/app/data anniversary-gallery
```

#### Common Port Examples

- **Default**: `PORT=3000` → http://localhost:3000
- **Alternative**: `PORT=8080` → http://localhost:8080
- **HTTP**: `PORT=80` → http://localhost (requires admin/sudo)
- **Custom**: `PORT=5000` → http://localhost:5000

## 📁 File Structure

```
anniversary-gallery/
├── server.js                 # Express server with API routes
├── package.json              # Node.js dependencies
├── Dockerfile                # Docker container definition
├── docker-compose.yml        # Docker Compose configuration
├── .env.example              # Environment variables template
├── .dockerignore             # Docker ignore rules
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── data/
│   └── photos.json           # Photo storage (auto-generated)
└── public/
    ├── index.html            # Main gallery page
    ├── admin.html            # Admin panel page
    ├── css/
    │   └── style.css         # Stylesheets
    └── js/
        ├── api.js            # API client
        ├── gallery.js        # Gallery React components
        └── admin.js          # Admin React components
```

## 🎮 Usage

### Gallery Controls

**Mouse/Desktop:**
- **Drag**: Rotate camera around the gallery
- **Scroll**: Zoom in/out
- **Quick Swipe Left**: Next photo
- **Quick Swipe Right**: Previous photo
- **Click Photo**: Focus on that photo
- **Next/Previous Buttons**: Navigate sequentially

**Touch/Mobile:**
- **Swipe**: Rotate camera (orbit view)
- **Two-Finger Pinch**: Zoom in/out
- **Quick Swipe Left**: Next photo
- **Quick Swipe Right**: Previous photo
- **Tap Photo**: Focus on that photo

### Admin Panel

Access: `http://localhost:3000/admin?admin=aryy`

**Features:**
- 📤 Upload photos (auto-compressed to JPEG)
- ✏️ Add/edit captions
- 🗑️ Delete photos
- 👁️ Preview before saving
- 💾 All changes saved to server

## 🔧 Configuration

### Server Configuration

Edit `server.js`:
```javascript
const PORT = 3000;           // Server port
const adminKey = 'aryy';     // Admin access key
```

### Image Compression

Edit `public/js/api.js`:
```javascript
compressImage(dataUrl, 1920, 0.85)
// maxWidth: 1920px
// quality: 0.85 (0-1 scale)
```

## 🐳 Docker Commands

```bash
# Build the image
docker-compose build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access container shell
docker exec -it anniversary-gallery sh
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photos` | Get all photos |
| POST | `/api/photos` | Save photos array |
| DELETE | `/api/photos/:id` | Delete specific photo |

### Example API Response

```json
{
  "photos": [
    {
      "id": "1703001234567",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "caption": "Our first anniversary! ❤️",
      "position": [2.5, 0.3, -1.2],
      "rotation": [0.1, -0.2, 0]
    }
  ]
}
```

## 💾 Data Storage

**Location**: `data/photos.json`

**Structure**: Each photo contains:
- `id`: Unique timestamp identifier
- `image`: Base64-encoded JPEG data
- `caption`: Photo caption/description
- `position`: [x, y, z] coordinates in 3D space
- `rotation`: [x, y, z] rotation angles

**Volume Mount**: The `data/` directory is mounted as a Docker volume to persist photos across container restarts.

## 🔒 Security Notes

- Admin panel requires `?admin=aryy` parameter
- Change the admin key in production
- Consider adding environment variables for sensitive data
- Base64 images are stored server-side (not in browser)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run with nodemon (auto-restart)
npm run dev

# Run normally
npm start
```

## 📦 Production Deployment

### Using Docker

1. Update `docker-compose.yml` for production
2. Set environment variables
3. Configure reverse proxy (nginx/caddy) if needed
4. Run: `docker-compose up -d`

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name anniversary-gallery
pm2 save
pm2 startup
```

## 🎯 Environment Variables

Create `.env` file (optional):
```env
PORT=3000
ADMIN_KEY=your-secret-key
NODE_ENV=production
```

## 📝 License

ISC

## 🙏 Credits

- **Three.js** - 3D rendering
- **Express** - Web server
- **React** - UI components

---

Made with ❤️ for celebrating special moments
