require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { getUploadsStaticRoot } = require('./utils/storageConfig');
const videosRouter = require('./routes/videos');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(['/api/videos', '/videos'], videosRouter);

// Serve uploaded videos
const uploadsStaticRoot = getUploadsStaticRoot();
app.use('/uploads', express.static(uploadsStaticRoot));

app.listen(PORT, () => {
  console.log(`Server backend berjalan di port ${PORT}`);
});
