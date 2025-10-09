const express = require('express');
const cors = require('cors');
const videosRouter = require('./routes/videos');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(['/api/videos', '/videos'], videosRouter);

// Serve uploaded videos
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server backend berjalan di port ${PORT}`);
});
