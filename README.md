# Photobooth AI Video Booth

Interactive photo booth experience that turns a single snapshot into a styled AI portrait and motion video in minutes. Guests capture a photo, pick a style, watch a cinematic processing sequence, and receive a branded video plus QR download link—all with automated FTP uploads and watermarking.

## Highlights

- Guided UX from welcome screen to final shareable video
- Gemini-powered style transfer and motion-video generation
- Smart orientation handling (portrait/landscape) across UI and rendering
- Automatic watermark overlay (resizes per orientation) before FTP upload
- Share flow with live QR code preview and modal zoom for easier scanning

## User Journey

1. **Welcome Screen** – branded entry screen with CTA to start.
2. **Photo Capture** – camera preview with orientation toggle, countdown, and watermark overlay.
3. **Preview & Confirm** – review shot, retake or continue.
4. **Styled Preview** – AI-styled still image with optional watermark overlay.
5. **Processing** – animated loading screen while motion video is generated.
6. **Result** – motion video playback, QR download link, modal zoom, and restart option.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind (via CDN), QRCode SVG
- **AI Services**: Google Gemini (style transfer & video generation)
- **Backend**: Node.js, Express, Multer, Fluent-FFmpeg, basic-ftp, dotenv
- **Tooling**: TypeScript (frontend), Nodemon for backend dev

## Repository Structure

```
Photobooth-AI-Video/
├─ src/                 # React front-end (Vite)
├─ public/              # Static assets (logos, watermark, loading graphics)
├─ backend/             # Express API & FTP integration
│  ├─ routes/           # video upload route
│  ├─ utils/            # storage + FFmpeg helpers
│  └─ .env.example      # backend environment template
├─ uploads/             # Generated videos (ignored in git)
├─ .env.local           # Frontend environment (ignored)
└─ README.md
```

## Prerequisites

- Node.js 18+ (includes npm)
- Google Gemini API access (Generative AI Studio)
- FTP account (optional; required when `WATERMARK_ENABLED` + FTP upload enabled)

## Setup

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd Photobooth-AI-Video
   npm install          # install frontend deps
   cd backend
   npm install          # install backend deps
   ```

2. **Configure environment variables**

   - **Frontend** (`.env.local` in the project root – already git-ignored):
     ```env
     GEMINI_API_KEY=your-gemini-api-key
     ```
     > Obtain the key from Google AI Studio and ensure the project has access to image + video generation models.

   - **Backend** (`backend/.env` – create by copying `.env.example`):
     ```bash
     cd backend
     cp .env.example .env
     ```
     Fill in:
     | Variable | Description |
     | --- | --- |
     | `PORT` | Backend port (default `3001`) |
     | `FTP_HOST` / `FTP_USER` / `FTP_PASSWORD` | FTP credentials |
     | `FTP_REMOTE_PATH` | Remote directory to upload videos |
     | `FTP_DISPLAY_URL` | Base URL used to serve uploaded files |
     | `FTP_PORT`, `FTP_SECURE`, `FTP_KEEP_LOCAL_COPY` | FTP connection options |
     | `UPLOAD_BASE_DIR` | Absolute/relative path for local video staging (default `../uploads/videos`) |
     | `WATERMARK_FILE_PATH` | Path to PNG watermark asset (`../public/logowatermark.png`) |
     | `WATERMARK_ENABLED` | `true`/`false` toggle for watermark processing |
     | `FILE_NAME_PREFIX` | Prefix for uploaded filenames (`digiOH`, etc.) |

     > If `WATERMARK_ENABLED=true`, the backend overlays the watermark using FFmpeg before uploading to FTP. Toggle to `false` to disable (no code changes needed).

3. **Run the app**

   - Backend (Express + FFmpeg watermarking + FTP):
     ```bash
     cd backend
     npm run dev      # nodemon server.js
     ```

   - Frontend (Vite dev server):
     ```bash
     cd ..            # back to project root
     npm run dev
     ```
     The UI defaults to http://localhost:5173 and proxies API calls to the backend.

## Watermark & FTP Workflow

- Frontend attaches orientation metadata during upload (`orientation=portrait|landscape`).
- Backend stores the video temporarily in `UPLOAD_BASE_DIR`.
- If watermarking is enabled and a watermark file exists:
  - FFmpeg scales the logo relative to video width (different ratios for portrait vs. landscape).
  - Watermark is placed bottom-left with padding.
- Processed file uploads to FTP (if FTP env configured); otherwise the local fallback URL is returned.
- Response includes `downloadUrl` for QR/links and a `watermark` status payload.
- `FTP_KEEP_LOCAL_COPY=false` removes local copies after successful FTP upload.

## Generated Assets

- `uploads/videos/` is ignored by git so large video files never enter the repo.
- Frontend displays videos from local blob URLs while upload runs in the background.
- Result screen includes a QR modal (tap to enlarge) for easier scanning at events.

## Tips & Customisation

- Update `public/logowatermark.png` to change branding across preview, processing, and final output.
- Modify copy, colours, and animations in `src/components/...` to match new events.
- Adjust QR modal text or size via `src/components/ResultScreen.tsx` (`size={320}` in the modal).
- Orientation logic lives in `src/App.tsx` and `backend/utils/videoProcessor.js`—tweak width ratios or margins if you need different watermark sizing.

## Troubleshooting

- **Watermark missing**: check backend logs; ensure FFmpeg dependencies installed (`npm install` inside `backend`) and `WATERMARK_FILE_PATH` points to a real file.
- **FTP upload fallback**: the server logs “Upload ke FTP gagal…” and returns local URL when credentials or remote paths are misconfigured.
- **Gemini errors**: confirm the API key has access to `veo-3.1-fast-generate-preview` and `gemini-2.5-flash-image`. Retry if quota exceeded.

---

Feel free to open issues or PRs for enhancements—or tailor the UI copy/branding to your next activation. Have fun building futuristic portraits! 🚀
