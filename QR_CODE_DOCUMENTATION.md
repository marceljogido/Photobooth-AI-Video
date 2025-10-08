# QR Code and Video Upload System Documentation

## Overview
Documentation for the QR code and video upload/download functionality in the Photobooth-AI-Video application.

## Architecture

### Frontend Components
- `ResultScreen.tsx`: Menampilkan video hasil dan QR code
- `geminiService.ts`: Mengandung fungsi untuk upload video ke server
- `App.tsx`: Menangani proses upload sebelum menampilkan ResultScreen

### Backend Components
- `backend/server.js`: Server Express utama
- `backend/routes/videos.js`: Endpoint untuk upload dan download video
- `uploads/videos/`: Folder penyimpanan video

## Flow Diagram

```
[AI generates video] → [Upload to server] → [Get unique URL] → [QR code & download]
```

### Detailed Flow:
1. AI menghasilkan video dari foto dan prompt gaya
2. Video disimpan sementara sebagai Blob URL di browser
3. Di `handleProcessingComplete` di `App.tsx`:
   - Panggil `uploadVideoToServer(videoUrl)`
   - Upload ke `/api/videos/upload`
   - Server simpan di `uploads/videos/` dengan nama unik
   - Server kembalikan URL download
4. Pindah ke `ResultScreen` dengan URL dari server
5. `ResultScreen` tampilkan video dan QR code dengan URL tersebut

## Frontend Implementation

### ResultScreen.tsx
```tsx
// Video ditampilkan dari URL dari server
<video src={videoSrc} ... />

// QR code menggunakan URL yang sama
<QRCodeSVG value={videoSrc} size={160} />

// Tombol download juga menggunakan URL yang sama
<a href={videoSrc} download="photobooth-video.mp4" ... />
```

### geminiService.ts
```typescript
export const uploadVideoToServer = async (videoUrl: string): Promise<string> => {
  // Ambil blob dari URL video
  const response = await fetch(videoUrl);
  const blob = await response.blob();
  
  // Buat FormData untuk upload
  const formData = new FormData();
  formData.append('video', blob, 'generated-video.mp4');
  
  // Kirim ke endpoint upload server
  const uploadResponse = await fetch('/api/videos/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await uploadResponse.json();
  return result.downloadUrl; // URL yang bisa digunakan untuk download
};
```

## Backend Implementation

### Upload Endpoint
```javascript
// backend/routes/videos.js
router.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  }
  
  const videoId = req.file.filename.split('_')[0]; // Ambil UUID dari nama file
  
  res.json({ 
    success: true, 
    videoId: videoId,
    downloadUrl: `/uploads/videos/${req.file.filename}`  // URL relatif untuk Nginx
  });
});
```

### Download Endpoint
```javascript
router.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'Video tidak ditemukan' });
  }
});
```

## Nginx Configuration

### Serving Uploaded Files
```nginx
location /uploads/ {
    alias /path/to/your/Photobooth-AI-Video/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

This allows direct access to uploaded videos without going through the backend.

## Security Considerations

### File Validation
- Hanya file MP4 yang diperbolehkan
- Batas ukuran file: 100MB
- Nama file diacak menggunakan UUID

### Access Control
- File disimpan di luar root publik (relatif terhadap root proyek)
- Nginx mengontrol akses ke file upload
- Path traversal dicegah oleh sistem file

## Troubleshooting

### Common Issues

1. **QR Code tidak berfungsi**
   - Pastikan Nginx dikonfigurasi dengan benar untuk serving `/uploads/`
   - Periksa apakah file video benar-benar disimpan di `uploads/videos/`
   - Verifikasi URL yang dihasilkan oleh backend

2. **Upload gagal**
   - Pastikan permission folder `uploads/videos/` benar
   - Periksa limit ukuran file di Nginx dan backend
   - Verifikasi koneksi antara frontend dan backend

3. **Video tidak muncul di ResultScreen**
   - Cek console browser untuk error
   - Pastikan API key diatur dengan benar
   - Verifikasi backend berjalan

### Debug Steps
```bash
# Cek apakah file diupload
ls -la uploads/videos/

# Cek log backend
cd backend && npm run dev

# Cek log browser
# Buka DevTools dan lihat tab Network & Console
```

## Testing

### Local Testing
1. Jalankan backend: `cd backend && npm run dev`
2. Jalankan frontend: `npm run dev`
3. Akses `http://localhost:3000`
4. Ikuti proses hingga layar result
5. Verifikasi QR code dan download

### Production Testing
1. Build frontend: `npm run build`
2. Deploy dengan Nginx
3. Pastikan konfigurasi Nginx sesuai
4. Uji QR code dari perangkat berbeda