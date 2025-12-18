// API Client for Anniversary Gallery

const API_BASE_URL = window.location.origin;

class GalleryAPI {
    /**
     * Get all photos from the server
     */
    static async getPhotos() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/photos`);
            if (!response.ok) {
                throw new Error('Failed to fetch photos');
            }
            const data = await response.json();
            return data.photos || [];
        } catch (error) {
            console.error('Error fetching photos:', error);
            return [];
        }
    }

    /**
     * Save photos to the server
     * @param {Array} photos - Array of photo objects
     */
    static async savePhotos(photos) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/photos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ photos }),
            });

            if (!response.ok) {
                throw new Error('Failed to save photos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving photos:', error);
            throw error;
        }
    }

    /**
     * Delete a photo from the server
     * @param {string} id - Photo ID to delete
     */
    static async deletePhoto(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete photo');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting photo:', error);
            throw error;
        }
    }
}

// Image compression utility
function compressImage(dataUrl, maxWidth = 1920, quality = 0.85) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with quality setting
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = dataUrl;
    });
}
