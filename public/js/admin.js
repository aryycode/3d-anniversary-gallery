// Admin Panel - React Components
const { useState, useEffect, useRef } = React;

// Admin Page Component
        function AdminPage({ photos, setPhotos }) {
            const [caption, setCaption] = useState('');
            const [imageData, setImageData] = useState('');
            const [editingId, setEditingId] = useState(null);
            const [isCompressing, setIsCompressing] = useState(false);
            const [isSaving, setIsSaving] = useState(false);

            const handleImageChange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    setIsCompressing(true);
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        try {
                            // Compress the image before storing
                            const compressed = await compressImage(reader.result, 1920, 0.85);
                            setImageData(compressed);
                        } catch (error) {
                            console.error('Error compressing image:', error);
                            alert('Gagal mengompres gambar. Silakan coba lagi.');
                        } finally {
                            setIsCompressing(false);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };

            const generateRandomPosition = () => {
                return [
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 8
                ];
            };

            const generateRandomRotation = () => {
                return [
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.5,
                    0
                ];
            };

            const handleSave = async () => {
                if (!imageData) {
                    alert('Silakan pilih gambar terlebih dahulu');
                    return;
                }

                setIsSaving(true);
                try {
                    const newPhoto = {
                        id: editingId || Date.now().toString(),
                        image: imageData,
                        caption: caption,
                        position: generateRandomPosition(),
                        rotation: generateRandomRotation()
                    };

                    let updatedPhotos;
                    if (editingId) {
                        updatedPhotos = photos.map(p => p.id === editingId ? newPhoto : p);
                    } else {
                        updatedPhotos = [...photos, newPhoto];
                    }

                    setPhotos(updatedPhotos);
                    await GalleryAPI.savePhotos(updatedPhotos);

                    setCaption('');
                    setImageData('');
                    setEditingId(null);

                    alert('Foto berhasil disimpan!');
                } catch (error) {
                    console.error('Error saving photo:', error);
                    alert('Gagal menyimpan foto. Silakan coba lagi atau gunakan gambar yang lebih kecil.');
                } finally {
                    setIsSaving(false);
                }
            };

            const handleEdit = (photo) => {
                setEditingId(photo.id);
                setCaption(photo.caption);
                setImageData(photo.image);
            };

            const handleDelete = async (id) => {
                if (confirm('Hapus foto ini?')) {
                    const updatedPhotos = photos.filter(p => p.id !== id);
                    setPhotos(updatedPhotos);
                    await GalleryAPI.savePhotos(updatedPhotos);
                }
            };

            return (
                <div style={{
                    padding: '20px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    backgroundColor: '#1a1a1a',
                    minHeight: '100vh',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ margin: 0 }}>Kelola Gallery</h2>
                        <a href="/" style={{ padding: "10px 20px", backgroundColor: "#444", color: "white", textDecoration: "none", borderRadius: "5px" }}>Kembali ke Gallery</a>
                    </div>

                    <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '10px',
                        marginBottom: '30px'
                    }}>
                        <h3>{editingId ? 'Edit Foto' : 'Tambah Foto Baru'}</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Upload Gambar:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isCompressing || isSaving}
                                style={{ width: '100%', padding: '10px' }}
                            />
                            {isCompressing && (
                                <p style={{ color: '#ffc107', marginTop: '10px' }}>⏳ Mengompres gambar...</p>
                            )}
                        </div>

                        {imageData && (
                            <div style={{ marginBottom: '15px' }}>
                                <img src={imageData} alt="Preview" style={{ maxWidth: '200px', borderRadius: '5px' }} />
                            </div>
                        )}

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Caption:</label>
                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Masukkan caption untuk foto..."
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #444',
                                    backgroundColor: '#333',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isCompressing || isSaving}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: (isCompressing || isSaving) ? '#666' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: (isCompressing || isSaving) ? 'not-allowed' : 'pointer',
                                marginRight: '10px',
                                opacity: (isCompressing || isSaving) ? 0.7 : 1
                            }}
                        >
                            {isSaving ? '💾 Menyimpan...' : (editingId ? 'Update' : 'Simpan')}
                        </button>

                        {editingId && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setCaption('');
                                    setImageData('');
                                }}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Batal
                            </button>
                        )}
                    </div>

                    <div>
                        <h3>Daftar Foto ({photos.length})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {photos.map(photo => (
                                <div key={photo.id} style={{
                                    backgroundColor: '#2a2a2a',
                                    padding: '10px',
                                    borderRadius: '8px'
                                }}>
                                    <img
                                        src={photo.image}
                                        alt={photo.caption}
                                        style={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '5px',
                                            marginBottom: '10px'
                                        }}
                                    />
                                    <p style={{ margin: '5px 0', fontSize: '14px' }}>{photo.caption || 'Tanpa caption'}</p>
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                        <button
                                            onClick={() => handleEdit(photo)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                backgroundColor: '#ffc107',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(photo.id)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        

// Admin App Component
function AdminApp() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            const loadedPhotos = await GalleryAPI.getPhotos();
            console.log('Loaded photos from server:', loadedPhotos.length);
            setPhotos(loadedPhotos);
        } catch (error) {
            console.log('Error loading photos:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>;
    }

    return <AdminPage photos={photos} setPhotos={setPhotos} />;
}

// Render Admin Panel
const adminRoot = ReactDOM.createRoot(document.getElementById('admin-root'));
adminRoot.render(<AdminApp />);
