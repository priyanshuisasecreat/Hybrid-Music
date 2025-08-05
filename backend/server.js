// backend/server.js (FINAL VERSION - soundcloud-scraper)
console.log("--- FINAL CODE v10 (soundcloud-scraper) CHAL RAHA HAI ---");

const express = require('express');
const cors = require('cors');
const scdl = require('soundcloud-scraper'); // Nayi library

const app = express();
const PORT = 3000;

// Nayi library ko initialize karna
const client = new scdl.Client();

app.use(cors());

// API Endpoint to search for SoundCloud tracks
app.get('/api/soundcloud-search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    // Library se search karna
    const searchResults = await client.search(query, 'track');

    if (!searchResults || searchResults.length === 0) {
      return res.json([]); // Khaali list bhejna agar kuch na mile
    }

    // SoundCloud se aaye data ko saaf karna
    const results = searchResults.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      url: track.url // Humein aage iski zaroorat padegi
    }));

    res.json(results);
  } catch (error) {
    console.error("SOUNDCLOUD SEARCH ERROR:", error);
    res.status(500).json({ error: 'Failed to search SoundCloud' });
  }
});

// API Endpoint to get the SoundCloud audio stream URL
app.get('/api/soundcloud-audio', async (req, res) => {
  const trackUrl = req.query.trackUrl;
  if (!trackUrl) return res.status(400).json({ error: 'Track URL is required' });

  try {
    // Library se song ki poori jaankari nikalna
    const song = await client.getSongInfo(trackUrl);
    
    // Library se audio stream nikalna
    const stream = await song.downloadProgressive();
    
    if (!stream || !stream.url) {
      return res.status(404).json({ error: 'Stream URL not found for this track.' });
    }

    res.json({ audioUrl: stream.url });

  } catch (error) {
    console.error("SOUNDCLOUD AUDIO FETCH ERROR:", error);
    res.status(500).json({ error: 'Failed to get audio stream from SoundCloud' });
  }
});

app.listen(PORT, () => {
  console.log(`Audio Helper Backend is running at http://localhost:${PORT}`);
  console.log(`Current Date in India: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
});