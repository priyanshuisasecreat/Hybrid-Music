// backend/server.js (THE REAL ABSOLUTE FINAL VERSION - No play-dl)
console.log("--- FINAL CODE v5 (Piped API) CORRECTED ---");

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
// play-dl yahan se hata diya gaya hai

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

// Piped ka ek public server
const PIPED_API_URL = "https://pipedapi.kavin.rocks";

app.use(cors());

// Search endpoint (yeh aaram se kaam karega, isme koi badlaav nahi)
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await youtube.search.list({
  part: 'snippet',
  q: query,
  type: 'video',
  maxResults: 10,
  videoCategoryId: '10'
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

// AUDIO ENDPOINT (Piped API ke saath)
app.get('/api/audio', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

  try {
    const pipedUrl = `${PIPED_API_URL}/streams/${videoId}`;
    const response = await fetch(pipedUrl);
    if (!response.ok) {
        throw new Error(`Piped API responded with status: ${response.status}`);
    }
    const data = await response.json();

    const bestAudioStream = data.audioStreams
      .sort((a, b) => b.bitrate - a.bitrate)[0];

    if (!bestAudioStream || !bestAudioStream.url) {
      return res.status(404).json({ error: 'No audio stream found via Piped.' });
    }
    res.json({ audioUrl: bestAudioStream.url });

  } catch (error) {
    console.log("!!!!!!!!!!!!!! AUDIO FETCH ME ERROR HUA (Piped) !!!!!!!!!!!!!!");
    console.error(error);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.status(500).json({ error: 'Failed to get audio stream via Piped' });
  }
});

app.listen(PORT, () => {
  console.log(`Audio Helper Backend is running at http://localhost:${PORT}`);
  console.log(`Current Date in India: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
});