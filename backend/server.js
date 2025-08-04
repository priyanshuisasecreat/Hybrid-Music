// backend/server.js (THE ABSOLUTE FINAL VERSION)
console.log("--- NAYA CODE v3 CHAL RAHA HAI ---");

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
// --- YAHAN BADLAAV KIYA GAYA HAI ---
const ytdl = require('ytdl-core-new');// Hum nayi library ka istemaal kar rahe hain

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

app.use(cors());

// API Endpoint to search for music videos
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await youtube.search.list({  // ✅ correct

      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 10,
      videoCategoryId: '10'
    });

    const results = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url
    }));

    res.json(results);
  } catch (error) {
    console.log("!!!!!!!!!!!!!! SEARCH ME ERROR HUA !!!!!!!!!!!!!!");
    console.error(error);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

// API Endpoint to get the audio stream URL
app.get('/api/audio', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

  try {
    const info = await ytdl.getInfo(videoId);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    if (!audioFormat) return res.status(404).json({ error: 'No audio-only stream found.' });
    res.json({ audioUrl: audioFormat.url });
  } catch (error) {
    console.log("!!!!!!!!!!!!!! AUDIO FETCH ME ERROR HUA !!!!!!!!!!!!!!");
    console.error(error);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.status(500).json({ error: 'Failed to get audio stream' });
  }
});

app.listen(PORT, () => {
  console.log(`Audio Helper Backend is running at http://localhost:${PORT}`);
  console.log(`Current Date in India: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
});
