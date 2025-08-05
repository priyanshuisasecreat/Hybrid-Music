// backend/server.js (FINAL VERSION - SoundCloud)
console.log("--- FINAL CODE v8 (SoundCloud API) CHAL RAHA HAI ---");

const express = require('express');
const cors = require('cors');
// googleapis hata diya gaya hai

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

app.use(cors());

// API Endpoint to search for SoundCloud tracks
app.get('/api/soundcloud-search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const searchUrl = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=${SOUNDCLOUD_CLIENT_ID}&limit=20`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    // SoundCloud se aaye data ko saaf karna
    const results = data.collection.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.user.username,
      thumbnail: track.artwork_url || track.user.avatar_url, // Use user avatar if artwork is missing
      duration: track.duration // in milliseconds
    }));

    res.json(results);
  } catch (error) {
    console.error("SOUNDCLOUD SEARCH ERROR:", error);
    res.status(500).json({ error: 'Failed to search SoundCloud' });
  }
});

// API Endpoint to get the SoundCloud audio stream URL
app.get('/api/soundcloud-audio', async (req, res) => {
  const trackId = req.query.trackId;
  if (!trackId) return res.status(400).json({ error: 'Track ID is required' });

  const trackUrl = `https://api-v2.soundcloud.com/tracks/${trackId}?client_id=${SOUNDCLOUD_CLIENT_ID}`;
  
  try {
    const response = await fetch(trackUrl);
    const trackData = await response.json();

    // Stream URL dhoondhna
    const streamUrlObject = trackData.media.transcodings.find(
      t => t.format.protocol === 'progressive' && t.format.mime_type === 'audio/mpeg'
    );

    if (!streamUrlObject || !streamUrlObject.url) {
      return res.status(404).json({ error: 'Progressive stream URL not found for this track.' });
    }

    // SoundCloud ke stream URL ko dobara fetch karke asli audio URL nikalna
    const streamInfoResponse = await fetch(`${streamUrlObject.url}?client_id=${SOUNDCLOUD_CLIENT_ID}`);
    const streamInfo = await streamInfoResponse.json();

    res.json({ audioUrl: streamInfo.url });

  } catch (error) {
    console.error("SOUNDCLOUD AUDIO FETCH ERROR:", error);
    res.status(500).json({ error: 'Failed to get audio stream from SoundCloud' });
  }
});

app.listen(PORT, () => {
  console.log(`Audio Helper Backend is running at http://localhost:${PORT}`);
  console.log(`Current Date in India: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
});