// backend/server.js (FINAL VERSION using play-dl)
console.log("--- FINAL CODE v4 (play-dl) CHAL RAHA HAI ---");

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const play = require('play-dl'); // Nayi library: play-dl

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

// play-dl ko cookies ke saath set up karna (ek baar)
play.setToken({
  youtube : {
    cookie: process.env.YOUTUBE_COOKIES || '',
  }
});

app.use(cors());

// Search endpoint (isme koi badlaav nahi)
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await youtube.search.list({  // ✅ correct
      part: 'snippet', q: query, type: 'video', maxResults: 10, videoCategoryId: '10'
    });
    const results = response.data.items.map(item => ({
      videoId: item.id.videoId, title: item.snippet.title, channel: item.snippet.channelTitle, thumbnail: item.snippet.thumbnails.default.url
    }));
    res.json(results);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

// --- AUDIO ENDPOINT (Puri Tarah Naya Code) ---
app.get('/api/audio', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

  try {
    // play-dl se stream information nikalna
    const stream = await play.stream(`https://www.youtube.com/watch?v=${videoId}`, {
        quality: 2 // 0 = lowest, 1 = low, 2 = high (audio ke liye)
    });

    if (!stream || !stream.url) {
        return res.status(404).json({ error: 'No audio stream found.' });
    }

    // Direct audio stream ka URL bhejna
    res.json({ audioUrl: stream.url });

  } catch (error) {
    console.log("!!!!!!!!!!!!!! AUDIO FETCH ME ERROR HUA (play-dl) !!!!!!!!!!!!!!");
    console.error(error);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.status(500).json({ error: 'Failed to get audio stream' });
  }
});

app.listen(PORT, () => {
  console.log(`Audio Helper Backend is running at http://localhost:${PORT}`);
  console.log(`Current Date in India: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
});