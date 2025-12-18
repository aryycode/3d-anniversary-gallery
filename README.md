# 🎉 3D Anniversary Gallery

Aplikasi web interaktif untuk menampilkan foto-foto anniversary dalam gallery 3D yang indah dan immersive. Foto-foto ditampilkan tersebar secara acak dalam ruang 3D dengan efek floating yang elegan.

![Anniversary Gallery Demo](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red)

## ✨ Fitur Utama

### 🖼️ Gallery 3D Interaktif

- **Scattered Layout**: Foto-foto tersebar tidak beraturan dalam ruang 3D untuk tampilan yang artistic
- **Smooth Navigation**: Klik foto untuk fokus dengan transisi kamera yang smooth
- **Floating Animation**: Setiap foto memiliki animasi floating yang halus
- **Interactive Controls**:
  - Mouse drag untuk rotate view
  - Scroll/pinch untuk zoom in/out
  - Keyboard arrows (←/→) untuk navigasi
  - Tombol Previous/Next di UI

### 🎨 Visual & Desain

- Background gradient gelap yang elegant
- Glow effect pada foto yang sedang aktif
- Border putih pada setiap frame foto
- Caption yang muncul saat hover atau foto aktif
- Responsive design untuk desktop dan mobile

### ⚙️ Admin Panel

- Upload foto dengan mudah (support drag & drop)
- Tambah caption untuk setiap foto
- Edit foto dan caption yang sudah ada
- Hapus foto
- Preview langsung sebelum save
- Grid layout untuk manajemen foto

### 💾 Data Persistence

- Semua foto dan data tersimpan di browser (localStorage)
- Data tidak hilang saat refresh atau tutup browser
- Tidak perlu database eksternal
- Privacy terjaga karena data tersimpan lokal

## 🚀 Deployment Options

### 1. Netlify (Termudah - Drag & Drop)

```bash
# Langsung drag & drop file index.html ke:
https://app.netlify.com/drop
```

### 2. Vercel

```bash
# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

### 3. GitHub Pages

```bash
# Push ke GitHub repository
git add .
git commit -m "Deploy anniversary gallery"
git push origin main

# Aktifkan GitHub Pages di Settings → Pages
```

### 4. Coolify (Self-Hosted)

**Opsi A: Static Site**

1. Push repository ke GitHub/GitLab
2. Di Coolify: New Resource → Public Repository
3. Pilih "Static Site" build pack
4. Deploy!

**Opsi B: Docker + Nginx**

```bash
# Build image
docker build -t anniversary-gallery .

# Run container
docker run -d -p 8080:80 anniversary-gallery
```

**Opsi C: Docker Compose**

```bash
docker-compose up -d
```

## 📁 Struktur Project

```
anniversary-gallery/
├── index.html          # Main application file
├── Dockerfile          # Docker configuration
├── nginx.conf          # Nginx configuration
├── docker-compose.yml  # Docker Compose setup
└── README.md          # Documentation
```

## 🛠️ Teknologi yang Digunakan

- **React 18** - UI framework
- **Three.js** - 3D rendering engine
- **Vanilla JavaScript** - Core functionality
- **HTML5 Canvas** - 3D graphics
- **LocalStorage API** - Data persistence
- **Nginx** - Web server (untuk Docker deployment)

## 💻 Cara Menggunakan

### Menambah Foto

1. Buka aplikasi di browser
2. Klik tombol **"Kelola Gallery"** di kanan atas
3. Klik **"Choose File"** untuk upload foto
4. Masukkan caption (opsional)
5. Klik **"Simpan"**
6. Klik **"Kembali ke Gallery"** untuk melihat hasilnya

### Navigasi Gallery

- **Mouse/Touch Drag**: Putar view untuk melihat sekeliling
- **Scroll/Pinch**: Zoom in dan zoom out
- **Klik Foto**: Fokus ke foto tertentu dengan transisi smooth
- **Arrow Keys (←/→)**: Navigasi ke foto sebelumnya/berikutnya
- **Tombol UI**: Previous dan Next button di bawah layar

### Edit/Hapus Foto

1. Masuk ke halaman **"Kelola Gallery"**
2. Klik **"Edit"** pada foto yang ingin diubah
3. Atau klik **"Hapus"** untuk menghapus foto

## 🔧 Konfigurasi

### Mengubah Posisi Foto

Edit fungsi `generateRandomPosition()` di dalam kode:

```javascript
const generateRandomPosition = () => {
  return [
    (Math.random() - 0.5) * 10, // X axis (horizontal spread)
    (Math.random() - 0.5) * 6, // Y axis (vertical spread)
    (Math.random() - 0.5) * 8, // Z axis (depth)
  ];
};
```

### Mengubah Rotasi Foto

Edit fungsi `generateRandomRotation()`:

```javascript
const generateRandomRotation = () => {
  return [
    (Math.random() - 0.5) * 0.3, // X rotation
    (Math.random() - 0.5) * 0.5, // Y rotation
    0, // Z rotation (keep flat)
  ];
};
```

### Mengubah Background

Cari style `background: 'linear-gradient(...)'` dan sesuaikan:

```javascript
style={{ background: 'linear-gradient(to bottom, #0a0a0a, #1a1a2e)' }}
```

## 🌐 Custom Domain Setup

### Untuk Netlify/Vercel:

1. Beli domain di Namecheap/GoDaddy
2. Di dashboard platform, tambahkan custom domain
3. Update DNS records di domain provider
4. SSL otomatis di-generate

### Untuk Coolify:

1. Deploy aplikasi terlebih dahulu
2. Di Coolify dashboard → tab "Domains"
3. Tambahkan domain Anda
4. Update DNS A record:
   - **Type**: A
   - **Name**: @ atau subdomain
   - **Value**: IP server Coolify
   - **TTL**: 3600
5. SSL otomatis via Let's Encrypt

## 🔒 Security Features

- Content Security Policy headers
- XSS protection enabled
- Frame options configured
- No external dependencies untuk runtime
- Data tersimpan lokal (tidak dikirim ke server)

## 📱 Browser Support

- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Minimum Requirements:**

- WebGL support
- ES6 JavaScript support
- LocalStorage enabled

## 🐛 Troubleshooting

### Foto tidak muncul setelah upload

- **Solusi**: Pastikan ukuran foto tidak terlalu besar (maksimal 5MB per foto)
- Kompres foto menggunakan tools online seperti TinyPNG

### Gallery 3D tidak render

- **Solusi**: Pastikan browser mendukung WebGL
- Test di https://get.webgl.org/

### Data hilang setelah clear browser

- **Solusi**: LocalStorage di-clear saat hapus browsing data
- Backup foto secara manual atau gunakan export feature (bisa ditambahkan)

### Performance lambat dengan banyak foto

- **Solusi**: Batasi jumlah foto maksimal 20-30 foto
- Kompres foto sebelum upload
- Gunakan resolusi yang lebih kecil (1920x1080 atau lebih rendah)

### Deploy di Coolify gagal

- **Solusi**:
  - Cek logs di Coolify dashboard
  - Pastikan port tidak bentrok
  - Verifikasi Dockerfile syntax

## 📊 Performance Tips

1. **Optimasi Foto**:

   - Ukuran maksimal: 5MB per foto
   - Resolusi recommended: 1920x1080px
   - Format: JPG (lebih kecil dari PNG)

2. **Jumlah Foto**:

   - Optimal: 10-20 foto
   - Maksimal recommended: 30 foto
   - Lebih dari 30 foto bisa memperlambat rendering

3. **Browser Cache**:
   - Foto di-cache otomatis di browser
   - First load mungkin lambat, subsequent load lebih cepat

## 🚧 Roadmap & Future Features

- [ ] Export/Import data sebagai JSON
- [ ] Tema warna yang bisa dikustomisasi
- [ ] Background music player
- [ ] Slideshow mode (auto-play)
- [ ] Sharing via link (dengan backend support)
- [ ] Mobile app version (React Native)
- [ ] Video support
- [ ] Collaborative mode (multiple users)

## 🤝 Contributing

Kontribusi sangat diterima! Untuk berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan MIT License - lihat file LICENSE untuk detail.

## 👨‍💻 Author

Dibuat dengan ❤️ untuk anniversary special

## 🙏 Acknowledgments

- Three.js untuk 3D rendering engine yang powerful
- React untuk UI framework
- Nginx untuk web server yang reliable
- Coolify untuk self-hosted deployment platform

## 📞 Support

Jika ada pertanyaan atau issue:

1. Buka issue di GitHub repository
2. Atau hubungi via email

---

**Happy Anniversary! 🎊💕**

Made with love for celebrating special moments together.
