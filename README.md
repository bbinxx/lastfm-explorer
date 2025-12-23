# Last.fm API Explorer

A beautiful, modern web application for exploring the Last.fm API. Built with Node.js and vanilla JavaScript, featuring a premium dark theme with glassmorphism effects.

![Last.fm API Explorer](https://img.shields.io/badge/Last.fm-API%20Explorer-d51007?style=for-the-badge&logo=lastdotfm)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## Features

### User Features
- **User Profile** - View detailed user information including scrobble count, artists, albums, and tracks
- **Recent Tracks** - See your listening history with "Now Playing" indicator
- **Top Artists** - Browse your most listened artists with time period filters
- **Top Albums** - Explore your favorite albums
- **Top Tracks** - View your most played songs
- **Loved Tracks** - Access your liked songs

### Discovery Features
- **Artist Search** - Find artists with detailed information
- **Track Search** - Search for songs across the platform
- **Album Search** - Discover albums by name
- **Global Charts** - View trending artists and tracks worldwide
- **Charts by Country** - Explore music trends by geographic region
- **Tags & Genres** - Browse music by genre tags

### Developer Features
- **API Documentation** - Each page includes collapsible API docs
- **Sample Code** - JavaScript and cURL examples for every endpoint
- **Copy to Clipboard** - One-click code copying

### Design Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Premium dark UI with gradient accents
- **Glassmorphism** - Modern frosted glass effects
- **Smooth Animations** - Polished micro-interactions
- **Font Awesome Icons** - Consistent iconography throughout

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm v8 or higher
- A Last.fm API key ([Get one here](https://www.last.fm/api/account/create))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lastfm-api-explorer.git
   cd lastfm-api-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Last.fm API key:
   ```env
   LASTFM_API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
lastfm-api-explorer/
├── public/
│   ├── css/
│   │   └── styles.css      # All application styles
│   ├── js/
│   │   └── app.js          # Frontend JavaScript application
│   └── index.html          # Main HTML file
├── server.js               # Express.js API server
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Example environment file
├── package.json            # Project dependencies
└── README.md               # This file
```

## API Endpoints

All endpoints are prefixed with `/api/`.

### User Methods

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/user/info` | Get user profile information | `user` (required) |
| `GET /api/user/recent-tracks` | Get recent listening history | `user`, `limit`, `page` |
| `GET /api/user/top-artists` | Get top artists | `user`, `period`, `limit` |
| `GET /api/user/top-albums` | Get top albums | `user`, `period`, `limit` |
| `GET /api/user/top-tracks` | Get top tracks | `user`, `period`, `limit` |
| `GET /api/user/loved-tracks` | Get loved tracks | `user`, `limit` |
| `GET /api/user/friends` | Get user's friends | `user`, `limit` |

### Artist Methods

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/artist/info` | Get artist information | `artist` (required), `user` |
| `GET /api/artist/similar` | Get similar artists | `artist` (required), `limit` |
| `GET /api/artist/top-tracks` | Get artist's top tracks | `artist` (required), `limit` |
| `GET /api/artist/top-albums` | Get artist's top albums | `artist` (required), `limit` |
| `GET /api/artist/search` | Search for artists | `artist` (required), `limit` |

### Track Methods

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/track/info` | Get track information | `track`, `artist` (both required) |
| `GET /api/track/similar` | Get similar tracks | `track`, `artist` (both required), `limit` |
| `GET /api/track/search` | Search for tracks | `track` (required), `limit` |

### Album Methods

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/album/info` | Get album information | `album`, `artist` (both required) |
| `GET /api/album/search` | Search for albums | `album` (required), `limit` |

### Chart Methods

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/chart/top-artists` | Get global top artists | `limit` |
| `GET /api/chart/top-tracks` | Get global top tracks | `limit` |
| `GET /api/chart/top-tags` | Get top tags/genres | `limit` |

### Geo Methods

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/geo/top-artists` | Get top artists by country | `country`, `limit` |
| `GET /api/geo/top-tracks` | Get top tracks by country | `country`, `limit` |

### Tag Methods

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `GET /api/tag/top` | Get popular tags | - |
| `GET /api/tag/info` | Get tag information | `tag` (required) |
| `GET /api/tag/top-artists` | Get top artists for a tag | `tag` (required), `limit` |
| `GET /api/tag/top-tracks` | Get top tracks for a tag | `tag` (required), `limit` |

## Usage Examples

### JavaScript (Fetch API)

```javascript
// Get user info
const response = await fetch('/api/user/info?user=rj');
const data = await response.json();
console.log(data.user.playcount); // Total scrobbles

// Search for an artist
const artists = await fetch('/api/artist/search?artist=radiohead&limit=5');
const results = await artists.json();
console.log(results.results.artistmatches.artist);

// Get top tracks for a country
const tracks = await fetch('/api/geo/top-tracks?country=japan&limit=10');
const chartData = await tracks.json();
console.log(chartData.tracks.track);
```

### cURL

```bash
# Get user info
curl "http://localhost:3000/api/user/info?user=rj"

# Search for artists
curl "http://localhost:3000/api/artist/search?artist=radiohead&limit=5"

# Get global top tracks
curl "http://localhost:3000/api/chart/top-tracks?limit=10"
```

## Period Values

For endpoints that accept a `period` parameter:

| Value | Description |
|-------|-------------|
| `overall` | All time (default) |
| `7day` | Last 7 days |
| `1month` | Last month |
| `3month` | Last 3 months |
| `6month` | Last 6 months |
| `12month` | Last year |

## Browser Storage

The application uses `localStorage` to persist:
- Username (key: `lastfm_explorer_username`)

On first visit, users are prompted to enter their Last.fm username, which is then stored locally.

## Customization

### Changing Colors

Edit the CSS custom properties in `public/css/styles.css`:

```css
:root {
    --accent-primary: #d51007;    /* Primary accent color */
    --accent-secondary: #ff1744;  /* Secondary accent */
    --bg-primary: #0a0a0f;        /* Main background */
    --bg-card: #16161f;           /* Card backgrounds */
}
```

### Adding New Endpoints

1. Add the route in `server.js`:
   ```javascript
   app.get('/api/your-endpoint', async (req, res) => {
       const data = await lastfmRequest('your.method', { params });
       res.json(data);
   });
   ```

2. Add the frontend in `public/js/app.js`:
   ```javascript
   async function renderYourSection() {
       const data = await fetchAPI('your-endpoint', { params });
       // Return HTML
   }
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Last.fm API](https://www.last.fm/api) for providing the music data
- [Font Awesome](https://fontawesome.com/) for the icons
- [Inter Font](https://fonts.google.com/specimen/Inter) for typography

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/lastfm-api-explorer/issues).

---

Made with music by developers who love Last.fm