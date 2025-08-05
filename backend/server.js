// backend/server.js (FINAL VERSION - RapidAPI v2)
console.log("--- FINAL CODE v6 (RapidAPI) CHAL RAHA HAI ---");

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Render se RapidAPI key uthana
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

app.use(cors());

// Search endpoint (yeh bilkul theek hai)
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
    console.log("!!!!!!!!!!!!!! SEARCH ME ERROR HUA !!!!!!!!!!!!!!");
    console.error(error);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

// AUDIO ENDPOINT (RapidAPI ke saath)
app.get('/api/audio', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

  // RapidAPI ke liye URL aur options taiyaar karna
  const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    if (data.status === "Success" && data.link) {
      res.json({ audioUrl: data.link });
    } else {
      throw new Error(data.message || 'Failed to fetch link from RapidAPI');
    }

  } catch (error) {
    console.log("!!!!!!!!!!!!!! AUDIO FETCH ME ERROR HUA (RapidAPI) !!!!!!!!!!!!!!");
    console.error(error);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.status(500).json({ error: 'Failed to get audio stream via RapidAPI' });
  }
});

app.listen(PORT, () => {
  console.log(`Audio Helper Backend is running at http://localhost:${PORT}`);
  console.log(`Current Date in India: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
});