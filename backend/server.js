// backend/server.js (THE REAL ABSOLUTE FINAL VERSION)
console.log("--- FINAL CODE v5 (Piped API) CHAL RAHA HAI ---");

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const play = require('play-dl'); // Nayi library: play-dl

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
// Yahan variable 'youtube' (small 'y' se) banaya gaya hai
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

// play-dl ko cookies ke saath set up karna
play.setToken({
  youtube : {
    cookie: process.env.YOUTUBE_COOKIES || '',
  }
});

// Piped ka ek public server
const PIPED_API_URL = "https://pipedapi.kavin.rocks";

app.use(cors());

// API Endpoint to search for music videos
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    // --- YAHAN GALTI THEEK KI GAYI HAI ---
    // Ab hum sahi variable 'youtube' (small 'y' se) ka istemaal kar rahe hain
    const response = await Youtube.list({
      part: 'snippet', q: query, type: 'video', maxResults: 10, videoCategoryId: '10'
    });
    const results = response.data.items.map(item => ({
      videoId: item.id.videoId, title: item.snippet.title, channel: item.snippet.channelTitle, thumbnail: item.snippet.thumbnails.default.url
    }));
    res.json(results);
  } catch (error) {
    console.log("!!!!!!!!!!!!!! SEARCH ME ERROR HUA !!!!!!!!!!!!!!");
    console.error(error);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

// API Endpoint to get the audio stream URL (using Piped)
app.get('/api/audio', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

  try {
    const pipedUrl = `${PIPED_API_URL}/streams/${videoId}`;
    const response = await fetch(pipedUrl);
    if (!response.ok) { // Check if Piped API returned an error
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