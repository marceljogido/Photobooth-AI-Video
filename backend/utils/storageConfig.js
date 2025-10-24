const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const toAbsolutePath = (value) => {
  if (!value) {
    return null;
  }
  return path.isAbsolute(value) ? value : path.resolve(projectRoot, value);
};

const getUploadDir = () => {
  const fallback = path.resolve(projectRoot, '..', 'uploads', 'videos');
  const fromEnv = toAbsolutePath(process.env.UPLOAD_BASE_DIR);
  return fromEnv || fallback;
};

const getUploadsStaticRoot = () => path.dirname(getUploadDir());

const getWatermarkPath = () => toAbsolutePath(process.env.WATERMARK_FILE_PATH);

const isWatermarkEnabled = () => {
  const flag = (process.env.WATERMARK_ENABLED || 'true').toLowerCase();
  return !(flag === 'false' || flag === '0' || flag === 'off');
};

module.exports = {
  projectRoot,
  getUploadDir,
  getUploadsStaticRoot,
  getWatermarkPath,
  isWatermarkEnabled,
};
