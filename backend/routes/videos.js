const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');
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

const fsPromises = fs.promises;

const ensureTrailingSlash = (value) => (value.endsWith('/') ? value : `${value}/`);

const normalizeRemotePath = (value = '') => {
  const sanitized = value.replace(/\\/g, '/').trim();
  if (!sanitized || sanitized === '/') {
    return '';
  }
  return sanitized.replace(/^\/+|\/+$/g, '');
};

const normalizeSecureOption = (value) => {
  if (!value) {
    return false;
  }
  const lowered = value.toLowerCase();
  if (lowered === 'implicit') {
    return 'implicit';
  }
  if (lowered === 'true') {
    return true;
  }
  return false;
};

const buildFtpDownloadUrl = (baseUrl, remotePath, filename) => {
  try {
    const sanitizedBase = ensureTrailingSlash(baseUrl);
    const remoteSegment = remotePath ? `${remotePath.replace(/^\/+/, '')}/` : '';
    return new URL(`${remoteSegment}${filename}`, sanitizedBase).toString();
  } catch (error) {
    console.error('FTP_DISPLAY_URL invalid, falling back to local URL.', error);
    return null;
  }
};

const getFtpConfig = () => {
  const {
    FTP_HOST,
    FTP_USER,
    FTP_PASSWORD,
    FTP_PORT,
    FTP_REMOTE_PATH,
    FTP_DISPLAY_URL,
    FTP_SECURE,
    FTP_KEEP_LOCAL_COPY,
    FTP_DEBUG
  } = process.env;

  if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD || !FTP_REMOTE_PATH || !FTP_DISPLAY_URL) {
    return null;
  }

  const parsedPort = Number(FTP_PORT);
  const port = Number.isSafeInteger(parsedPort) && parsedPort > 0 ? parsedPort : 21;

  return {
    host: FTP_HOST,
    user: FTP_USER,
    password: FTP_PASSWORD,
    port,
    remotePath: normalizeRemotePath(FTP_REMOTE_PATH),
    displayUrl: FTP_DISPLAY_URL,
    secure: normalizeSecureOption(FTP_SECURE),
    keepLocalCopy: FTP_KEEP_LOCAL_COPY === 'true',
    debug: FTP_DEBUG === 'true'
  };
};

// Endpoint untuk upload video
router.post('/upload', upload.single('video'), async (req, res) => {
  console.log('Menerima permintaan upload video');
  if (!req.file) {
    console.log('Tidak ada file dalam permintaan upload');
    return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  }

  try {
    console.log('File berhasil diupload:', req.file.filename);
    const videoId = req.file.filename.split('_')[0];
    const filePath = path.join(uploadDir, req.file.filename);

    if (fs.existsSync(filePath)) {
      console.log('File tersimpan di server lokal:', filePath);
    } else {
      console.warn('File TIDAK ditemukan di server lokal setelah upload:', filePath);
    }

    const ftpConfig = getFtpConfig();
    const fallbackDownloadUrl = buildDownloadUrl(req, req.file.filename);
    let downloadUrl = fallbackDownloadUrl;
    let storage = 'local';

    if (ftpConfig) {
      console.log('Konfigurasi FTP terdeteksi. Memulai upload ke FTP...');
      const client = new ftp.Client();
      client.ftp.verbose = ftpConfig.debug;

      try {
        await client.access({
          host: ftpConfig.host,
          port: ftpConfig.port,
          user: ftpConfig.user,
          password: ftpConfig.password,
          secure: ftpConfig.secure
        });

        if (ftpConfig.remotePath) {
          await client.ensureDir(ftpConfig.remotePath);
        }

        await client.uploadFrom(filePath, req.file.filename);
        console.log('Upload ke FTP berhasil untuk file:', req.file.filename);

        const ftpDownloadUrl = buildFtpDownloadUrl(
          ftpConfig.displayUrl,
          ftpConfig.remotePath,
          req.file.filename
        );

        if (ftpDownloadUrl) {
          downloadUrl = ftpDownloadUrl;
          storage = 'ftp';
        }

        if (!ftpConfig.keepLocalCopy) {
          try {
            await fsPromises.unlink(filePath);
            console.log('File lokal dihapus setelah upload FTP:', filePath);
          } catch (removeError) {
            console.warn('Gagal menghapus file lokal setelah upload FTP:', removeError);
          }
        }
      } catch (ftpError) {
        console.error('Upload ke FTP gagal. Menggunakan penyimpanan lokal sebagai fallback.', ftpError);
      } finally {
        client.close();
      }
    }

    res.json({
      success: true,
      videoId,
      downloadUrl,
      storage
    });
  } catch (error) {
    console.error('Terjadi kesalahan saat memproses upload video:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses upload video' });
  }
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
