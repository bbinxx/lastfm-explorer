require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Last.fm API configuration
const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';
const API_KEY = process.env.LASTFM_API_KEY;
const DEFAULT_USER = process.env.LASTFM_USERNAME;

// Helper function to make Last.fm API requests
async function lastfmRequest(method, params = {}) {
    const queryParams = new URLSearchParams({
        method,
        api_key: API_KEY,
        format: 'json',
        ...params
    });

    const response = await fetch(`${LASTFM_API_BASE}?${queryParams}`);
    const data = await response.json();

    if (data.error) {
        throw new Error(data.message || 'Last.fm API error');
    }

    return data;
}

// ==================== USER METHODS ====================

// Get user info
app.get('/api/user/info', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const data = await lastfmRequest('user.getInfo', { user });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent tracks
app.get('/api/user/recent-tracks', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const limit = req.query.limit || 10;
        const page = req.query.page || 1;
        const data = await lastfmRequest('user.getRecentTracks', { user, limit, page });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top artists
app.get('/api/user/top-artists', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const period = req.query.period || 'overall'; // overall, 7day, 1month, 3month, 6month, 12month
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('user.getTopArtists', { user, period, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top albums
app.get('/api/user/top-albums', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const period = req.query.period || 'overall';
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('user.getTopAlbums', { user, period, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top tracks
app.get('/api/user/top-tracks', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const period = req.query.period || 'overall';
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('user.getTopTracks', { user, period, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get loved tracks
app.get('/api/user/loved-tracks', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('user.getLovedTracks', { user, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get friends
app.get('/api/user/friends', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('user.getFriends', { user, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get weekly artist chart
app.get('/api/user/weekly-artists', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const data = await lastfmRequest('user.getWeeklyArtistChart', { user });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get weekly track chart
app.get('/api/user/weekly-tracks', async (req, res) => {
    try {
        const user = req.query.user || DEFAULT_USER;
        const data = await lastfmRequest('user.getWeeklyTrackChart', { user });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ARTIST METHODS ====================

// Get artist info
app.get('/api/artist/info', async (req, res) => {
    try {
        const artist = req.query.artist;
        if (!artist) {
            return res.status(400).json({ error: 'Artist name is required' });
        }
        const user = req.query.user || DEFAULT_USER;
        const data = await lastfmRequest('artist.getInfo', { artist, user });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get similar artists
app.get('/api/artist/similar', async (req, res) => {
    try {
        const artist = req.query.artist;
        if (!artist) {
            return res.status(400).json({ error: 'Artist name is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('artist.getSimilar', { artist, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get artist top tracks
app.get('/api/artist/top-tracks', async (req, res) => {
    try {
        const artist = req.query.artist;
        if (!artist) {
            return res.status(400).json({ error: 'Artist name is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('artist.getTopTracks', { artist, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get artist top albums
app.get('/api/artist/top-albums', async (req, res) => {
    try {
        const artist = req.query.artist;
        if (!artist) {
            return res.status(400).json({ error: 'Artist name is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('artist.getTopAlbums', { artist, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search artists
app.get('/api/artist/search', async (req, res) => {
    try {
        const artist = req.query.artist;
        if (!artist) {
            return res.status(400).json({ error: 'Search term is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('artist.search', { artist, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TRACK METHODS ====================

// Get track info
app.get('/api/track/info', async (req, res) => {
    try {
        const track = req.query.track;
        const artist = req.query.artist;
        if (!track || !artist) {
            return res.status(400).json({ error: 'Track and artist names are required' });
        }
        const user = req.query.user || DEFAULT_USER;
        const data = await lastfmRequest('track.getInfo', { track, artist, user });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get similar tracks
app.get('/api/track/similar', async (req, res) => {
    try {
        const track = req.query.track;
        const artist = req.query.artist;
        if (!track || !artist) {
            return res.status(400).json({ error: 'Track and artist names are required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('track.getSimilar', { track, artist, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search tracks
app.get('/api/track/search', async (req, res) => {
    try {
        const track = req.query.track;
        if (!track) {
            return res.status(400).json({ error: 'Search term is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('track.search', { track, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ALBUM METHODS ====================

// Get album info
app.get('/api/album/info', async (req, res) => {
    try {
        const album = req.query.album;
        const artist = req.query.artist;
        if (!album || !artist) {
            return res.status(400).json({ error: 'Album and artist names are required' });
        }
        const data = await lastfmRequest('album.getInfo', { album, artist });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search albums
app.get('/api/album/search', async (req, res) => {
    try {
        const album = req.query.album;
        if (!album) {
            return res.status(400).json({ error: 'Search term is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('album.search', { album, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TAG METHODS ====================

// Get top tags
app.get('/api/tag/top', async (req, res) => {
    try {
        const data = await lastfmRequest('tag.getTopTags');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tag info
app.get('/api/tag/info', async (req, res) => {
    try {
        const tag = req.query.tag;
        if (!tag) {
            return res.status(400).json({ error: 'Tag name is required' });
        }
        const data = await lastfmRequest('tag.getInfo', { tag });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top artists by tag
app.get('/api/tag/top-artists', async (req, res) => {
    try {
        const tag = req.query.tag;
        if (!tag) {
            return res.status(400).json({ error: 'Tag name is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('tag.getTopArtists', { tag, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top tracks by tag
app.get('/api/tag/top-tracks', async (req, res) => {
    try {
        const tag = req.query.tag;
        if (!tag) {
            return res.status(400).json({ error: 'Tag name is required' });
        }
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('tag.getTopTracks', { tag, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CHART METHODS ====================

// Get chart top artists
app.get('/api/chart/top-artists', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('chart.getTopArtists', { limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chart top tracks
app.get('/api/chart/top-tracks', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('chart.getTopTracks', { limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chart top tags
app.get('/api/chart/top-tags', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('chart.getTopTags', { limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== GEO METHODS ====================

// Get top artists by country
app.get('/api/geo/top-artists', async (req, res) => {
    try {
        const country = req.query.country || 'united states';
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('geo.getTopArtists', { country, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top tracks by country
app.get('/api/geo/top-tracks', async (req, res) => {
    try {
        const country = req.query.country || 'united states';
        const limit = req.query.limit || 10;
        const data = await lastfmRequest('geo.getTopTracks', { country, limit });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎵 Last.fm API Explorer is running!`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`👤 Default User: ${DEFAULT_USER}`);
    console.log(`🔑 API Key: ${API_KEY ? 'Configured' : 'Not Set'}\n`);
});
