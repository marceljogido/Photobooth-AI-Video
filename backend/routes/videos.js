const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const buildDownloadUrl = (req, filename) => {
  const downloadPath = `/uploads/videos/${filename}`;
  const configuredBase = process.env.PUBLIC_BASE_URL || process.env.BASE_URL;

  if (configuredBase) {
    try {
      return new URL(downloadPath, configuredBase).toString();
    } catch (error) {
      console.warn('Invalid PUBLIC_BASE_URL/BASE_URL value. Falling back to request host.', error);
    }
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto
    ? forwardedProto.split(',')[0]
    : req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}${downloadPath}`;
};

// Buat direktori uploads/videos jika belum ada
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi multer untuk upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gunakan UUID untuk nama file unik
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file MP4 yang diperbolehkan'));
    }
  }
});

// Endpoint untuk upload video
router.post('/upload', upload.single('video'), (req, res) => {
  console.log("Menerima permintaan upload video");
  if (!req.file) {
    console.log("Tidak ada file dalam permintaan upload");
    return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  }
  
  console.log("File berhasil diupload:", req.file.filename);
  const videoId = req.file.filename.split('_')[0]; // Ambil UUID dari nama file
  
  // Log tambahan untuk memastikan file benar-benar ada di sistem file
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '..', '..', 'uploads', 'videos', req.file.filename);
  
  if (fs.existsSync(filePath)) {
    console.log("File benar-benar ada di sistem:", filePath);
  } else {
    console.log("File TIDAK DITEMUKAN di sistem:", filePath);
  }
  
  // Dalam production, kita akan mengakses file video melalui Nginx
  // Format URL: /uploads/videos/[filename]
  // Nginx akan menyelesaikan permintaan ini langsung dari folder uploads
  res.json({ 
    success: true, 
    videoId: videoId,
    downloadUrl: buildDownloadUrl(req, req.file.filename)
  });
});

// Endpoint untuk download video berdasarkan nama file
router.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  
  // Cek apakah file ada
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'Video tidak ditemukan' });
  }
});

module.exports = router;
