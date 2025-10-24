const path = require('path');
const fs = require('fs/promises');
const ffmpeg = require('fluent-ffmpeg');
const { path: ffmpegPath } = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const probeVideo = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });

const clampRatio = (value, fallback) => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0.01, Math.min(1, value));
};

const applyWatermark = async (inputPath, watermarkPath, options = {}) => {
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);
  const tempOutput = path.join(dir, `${baseName}__wm${ext}`);
  const {
    orientation: forcedOrientation,
    margin = 40,
    portraitWidthRatio = 0.28,
    landscapeWidthRatio = 0.22,
  } = options;

  try {
    const metadata = await probeVideo(inputPath).catch(() => null);
    const videoStream = metadata?.streams?.find((stream) => stream.codec_type === 'video');
    const videoWidth = videoStream?.width || 1920;
    const videoHeight = videoStream?.height || 1080;

    const normalizedOrientation =
      forcedOrientation === 'portrait' || forcedOrientation === 'landscape'
        ? forcedOrientation
        : videoWidth >= videoHeight
        ? 'landscape'
        : 'portrait';

    const widthRatio =
      normalizedOrientation === 'portrait'
        ? clampRatio(portraitWidthRatio, 0.28)
        : clampRatio(landscapeWidthRatio, 0.22);

    const targetWidth = Math.max(1, Math.round(videoWidth * widthRatio));
    const overlayMargin = typeof margin === 'number' && Number.isFinite(margin) ? margin : 40;
    const overlayX = overlayMargin;
    const overlayYExpr = `main_h-overlay_h-${overlayMargin}`;

    const scaleFilter = `[1:v]scale='min(${targetWidth},iw)':-1[wm]`;
    const overlayFilter = `[0:v][wm]overlay=${overlayX}:${overlayYExpr}`;
    const filterGraph = `${scaleFilter};${overlayFilter}`;

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .input(watermarkPath)
        .complexFilter(filterGraph)
        .outputOptions('-c:a copy')
        .on('end', resolve)
        .on('error', reject)
        .save(tempOutput);
    });

    await fs.unlink(inputPath).catch(() => {});
    await fs.rename(tempOutput, inputPath);
    return inputPath;
  } catch (error) {
    await fs.unlink(tempOutput).catch(() => {});
    throw error;
  }
};

module.exports = {
  applyWatermark,
};
