# Photobooth-AI-Video Deployment Guide

## Deskripsi Proyek
Aplikasi photobooth AI yang menggabungkan teknologi Google AI untuk mengubah foto statis menjadi video gerak. Proyek ini memungkinkan pengguna mengambil foto, memilih gaya seni, dan menghasilkan video gerak yang bisa diunduh dan dibagikan melalui QR code.

## Struktur Proyek
```
Photobooth-AI-Video/
├── backend/                # Server backend (Node.js/Express)
│   ├── routes/
│   │   └── videos.js      # Endpoint untuk upload/download video
│   └── server.js          # Server utama
├── src/                    # Kode sumber frontend
│   ├── components/         # React components
│   ├── services/           # Service API (AI integration)
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── uploads/                # Folder untuk menyimpan video yang diupload
│   └── videos/            # Video hasil dari AI
├── public/                 # File-file statis (jika ada)
├── index.html             # HTML entry point
├── .env.local             # Environment variables (harus dibuat)
├── package.json           # Dependencies frontend
├── backend/package.json   # Dependencies backend
└── nginx_config.txt       # Konfigurasi Nginx untuk production
```

## Local Development Setup

### 1. Install Dependencies
```bash
# Install dependencies untuk frontend
npm install

# Install dependencies untuk backend
cd backend
npm install
```

### 2. Setup Environment
Buat file `.env.local` di root direktori:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Jika backend dijalankan secara terpisah, buat file `.env` di folder `backend/` untuk menyimpan konfigurasi server. Contoh:
```env
# Server config
PORT=3001

# (Opsional) Konfigurasi URL publik untuk fallback ke penyimpanan lokal
PUBLIC_BASE_URL=https://your-backend-domain.example.com

# (Opsional) Upload langsung ke FTP
FTP_HOST=ftp.example.com
FTP_USER=your_ftp_username
FTP_PASSWORD=your_ftp_password
FTP_PORT=21
FTP_REMOTE_PATH=/path/to/remote/folder/
FTP_DISPLAY_URL=https://your-public-url/
# FTP_SECURE=true          # set ke 'true' untuk FTPS eksplisit atau 'implicit' untuk FTPS implisit
# FTP_KEEP_LOCAL_COPY=true # set ke 'true' jika ingin tetap menyimpan file di server setelah upload FTP
# FTP_DEBUG=true           # aktifkan log detail dari client FTP
```

### 3. Run Development Servers

**Backend Server** (Terminal 1):
```bash
cd backend
npm run dev
```
Backend akan berjalan di `http://localhost:3001`

**Frontend Server** (Terminal 2):
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:3000`

### 4. Testing Local
1. Buka `http://localhost:3000` di browser
2. Ikuti alur aplikasi:
   - Capture Photo → Preview → Style Selection → Styled Preview → Processing → Result
3. Di layar Result:
   - Video akan secara otomatis diupload ke server
   - QR code akan menampilkan URL download yang valid
   - Tombol download akan tersedia
   - File video akan disimpan di `uploads/videos/`

## Production Deployment Guide

### 1. Build Frontend
```bash
npm run build
```
Ini akan membuat folder `dist/` yang berisi file-file siap deploy.

### 2. Configure Nginx
Gunakan konfigurasi dari `nginx_config.txt`, pastikan untuk:
- Mengganti `your-domain.com` dengan domain Anda
- Mengganti path `/path/to/your/Photobooth-AI-Video/` dengan path sebenarnya di server
- Menyesuaikan port jika backend tidak berjalan di 3001

Contoh konfigurasi Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Konfigurasi untuk upload file besar
    client_max_body_size 100M;
    
    # Timeout konfigurasi
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    
    # Lokasi untuk file statis (build frontend)
    location / {
        root /path/to/your/Photobooth-AI-Video/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Lokasi untuk file upload (video hasil AI)
    location /uploads/ {
        alias /path/to/your/Photobooth-AI-Video/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Pastikan hanya file yang diizinkan yang bisa diakses
        location ~* \.(mp4|webm|avi|mov)$ {
            # Konfigurasi khusus untuk file video
        }
    }
    
    # Proxy ke backend server
    location /api/ {
        proxy_pass http://localhost:3001/;  # Sesuaikan port jika berbeda
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
}
```

### 3. Deploy Backend
- Pastikan backend berjalan di server (port 3001 atau sesuaikan)
- Gunakan process manager seperti PM2 untuk menjaga backend tetap berjalan:
```bash
npm install -g pm2
cd backend
pm2 start server.js --name "photobooth-backend"
```

### 4. Permissions
Pastikan folder `uploads/videos/` memiliki permission yang tepat untuk menulis file:
```bash
mkdir -p uploads/videos
chown -R www-data:www-data uploads/
chmod -R 755 uploads/
```

### FTP Upload (Opsional)
- Jika variabel FTP dikonfigurasi, backend akan mengunggah file hasil AI ke server FTP setelah menerima upload dari frontend.
- URL yang dikembalikan ke frontend akan menggunakan `FTP_DISPLAY_URL` sebagai base path. Pastikan jalur FTP dan jalur publik berada pada struktur yang sama.
- Set `FTP_KEEP_LOCAL_COPY=true` apabila tetap ingin menyimpan file di server lokal sebagai backup. Default-nya file lokal akan dihapus setelah upload FTP berhasil.
- Untuk server FTPS, set `FTP_SECURE=true` (FTPS eksplisit) atau `FTP_SECURE=implicit` untuk FTPS implisit.
- Jika upload FTP gagal, server otomatis fallback ke penyimpanan lokal (`/uploads/videos/`) sehingga alur aplikasi tetap berfungsi.

## Fungsionalitas QR Code

### Cara Kerja
1. Setelah video dihasilkan oleh AI, frontend mengupload video ke server melalui endpoint `/api/videos/upload`
2. Server menyimpan video di folder `uploads/videos/` dan mengembalikan URL unik
3. URL ini digunakan untuk:
   - Menampilkan video di layar Result
   - Membuat QR code
   - Menyediakan tombol download

### Akses Publik
- Video yang disimpan di `uploads/videos/` dapat diakses secara publik melalui URL `/uploads/videos/[filename]`
- Nginx dikonfigurasi untuk menyajikan file-file ini secara langsung
- Ini memungkinkan QR code mengarah ke URL yang bisa diakses dari perangkat lain

## Development Notes

### Path Aliases
Proyek ini menggunakan path aliases berikut:
- `@/*` → Root direktori
- `@src/*` → `src/` folder
- `@components/*` → `src/components/` folder
- `@services/*` → `src/services/` folder

### Error Handling
- Frontend memiliki error handling untuk upload video gagal
- Backend mengembalikan pesan error yang informatif
- Video sementara dibersihkan jika terjadi error

### File Upload Limit
- Maksimal ukuran upload: 100MB
- Hanya file MP4 yang diperbolehkan
- Nama file diacak untuk mencegah konflik
