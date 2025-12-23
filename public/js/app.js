// Last.fm API Explorer - Main Application
(function () {
    'use strict';

    // State Management
    const state = {
        currentUser: null,
        currentSection: 'dashboard',
        isLoading: false
    };

    // DOM Elements
    const elements = {
        sidebar: document.getElementById('sidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        mainContent: document.getElementById('mainContent'),
        contentWrapper: document.getElementById('contentWrapper'),
        pageTitle: document.getElementById('pageTitle'),
        pageSubtitle: document.getElementById('pageSubtitle'),
        currentUsername: document.getElementById('currentUsername'),
        nowPlayingText: document.getElementById('nowPlayingText'),
        usernameInput: document.getElementById('usernameInput'),
        updateUserBtn: document.getElementById('updateUser'),
        toastContainer: document.getElementById('toastContainer'),
        navItems: document.querySelectorAll('.nav-item')
    };

    // Storage Keys
    const STORAGE_KEYS = {
        USERNAME: 'lastfm_explorer_username'
    };

    // Initialize Application
    function init() {
        checkFirstTimeUser();
        setupEventListeners();
        setupMobileMenu();
    }

    // Check if first time user
    function checkFirstTimeUser() {
        const savedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);

        if (!savedUsername) {
            showUsernameModal();
        } else {
            state.currentUser = savedUsername;
            elements.usernameInput.value = savedUsername;
            elements.currentUsername.textContent = savedUsername;
            loadSection('dashboard');
        }
    }

    // Show username modal for first-time users
    function showUsernameModal() {
        const modal = document.createElement('div');
        modal.className = 'username-modal';
        modal.innerHTML = `
            <div class="username-modal-content">
                <div class="modal-icon">
                    <i class="fas fa-music"></i>
                </div>
                <h2>Welcome to Last.fm Explorer</h2>
                <p>Enter your Last.fm username to get started</p>
                <div class="modal-input-wrapper">
                    <i class="fas fa-user"></i>
                    <input type="text" id="modalUsernameInput" placeholder="Your Last.fm username" autocomplete="off">
                </div>
                <button id="modalConfirmBtn" class="modal-btn">
                    <i class="fas fa-arrow-right"></i>
                    Get Started
                </button>
                <p class="modal-note">You can change this anytime from the sidebar</p>
            </div>
        `;

        document.body.appendChild(modal);

        const modalInput = document.getElementById('modalUsernameInput');
        const confirmBtn = document.getElementById('modalConfirmBtn');

        modalInput.focus();

        confirmBtn.addEventListener('click', () => {
            const username = modalInput.value.trim();
            if (username) {
                saveUsername(username);
                modal.classList.add('fade-out');
                setTimeout(() => modal.remove(), 300);
            } else {
                showToast('Please enter a username', 'error');
                modalInput.focus();
            }
        });

        modalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
    }

    // Save username to localStorage
    function saveUsername(username) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        state.currentUser = username;
        elements.usernameInput.value = username;
        elements.currentUsername.textContent = username;
        showToast(`Welcome, ${username}!`, 'success');
        loadSection('dashboard');
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Navigation
        elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    setActiveNavItem(item);
                    loadSection(section);
                }
            });
        });

        // Update User
        elements.updateUserBtn.addEventListener('click', () => {
            const newUsername = elements.usernameInput.value.trim();
            if (newUsername && newUsername !== state.currentUser) {
                saveUsername(newUsername);
                loadSection(state.currentSection);
            } else if (!newUsername) {
                showToast('Please enter a username', 'error');
            }
        });

        elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.updateUserBtn.click();
            }
        });

        // Sidebar Toggle
        if (elements.sidebarToggle) {
            elements.sidebarToggle.addEventListener('click', toggleSidebar);
        }
    }

    // Set Active Navigation Item
    function setActiveNavItem(activeItem) {
        elements.navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
        closeMobileMenu();
    }

    // Toggle Sidebar
    function toggleSidebar() {
        const sidebar = elements.sidebar;
        const overlay = document.getElementById('sidebarOverlay');
        const menuBtn = document.getElementById('mobileMenuBtn');

        sidebar.classList.toggle('open');
        overlay?.classList.toggle('active');
        menuBtn?.classList.toggle('active');
    }

    // Close Mobile Menu
    function closeMobileMenu() {
        const sidebar = elements.sidebar;
        const overlay = document.getElementById('sidebarOverlay');
        const menuBtn = document.getElementById('mobileMenuBtn');

        sidebar.classList.remove('open');
        overlay?.classList.remove('active');
        menuBtn?.classList.remove('active');
    }

    // Setup Mobile Menu
    function setupMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const overlay = document.getElementById('sidebarOverlay');

        if (menuBtn) {
            menuBtn.addEventListener('click', toggleSidebar);
        }

        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }
    }

    // API Documentation Helper
    function renderApiDocs(config) {
        return `
            <div class="api-docs">
                <button class="api-docs-toggle" onclick="this.classList.toggle('active'); this.nextElementSibling.classList.toggle('show');">
                    <span class="toggle-text"><i class="fas fa-code"></i> View API Documentation & Sample Code</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="api-docs-content">
                    <h4><i class="fas fa-link"></i> API Endpoint</h4>
                    <div class="endpoint">
                        <span class="method">GET</span>
                        <span class="url">${config.endpoint}</span>
                    </div>
                    
                    <h4><i class="fas fa-cog"></i> Parameters</h4>
                    <table class="params-table">
                        <thead>
                            <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            ${config.params.map(p => `
                                <tr>
                                    <td class="param-name">${p.name}</td>
                                    <td class="param-type">${p.type}</td>
                                    <td><span class="${p.required ? 'param-required' : 'param-optional'}">${p.required ? 'Required' : 'Optional'}</span></td>
                                    <td>${p.description}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <h4><i class="fas fa-terminal"></i> JavaScript Example</h4>
                    <div class="code-block">
                        <button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                        <pre>${escapeHtml(config.code)}</pre>
                    </div>
                    
                    <h4><i class="fas fa-file-code"></i> cURL Example</h4>
                    <div class="code-block">
                        <button class="copy-btn" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                        <pre>${escapeHtml(config.curl)}</pre>
                    </div>
                </div>
            </div>
        `;
    }

    // Copy code to clipboard
    window.copyCode = function (btn) {
        const code = btn.nextElementSibling.textContent;
        navigator.clipboard.writeText(code).then(() => {
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
    };

    // Load Section
    async function loadSection(section) {
        if (!state.currentUser) {
            showUsernameModal();
            return;
        }

        state.currentSection = section;
        showLoading();

        const sectionConfig = getSectionConfig(section);
        elements.pageTitle.textContent = sectionConfig.title;
        elements.pageSubtitle.textContent = sectionConfig.subtitle;

        try {
            const content = await sectionConfig.render();
            elements.contentWrapper.innerHTML = content;
        } catch (error) {
            console.error('Error loading section:', error);
            elements.contentWrapper.innerHTML = renderError(error.message);
        }
    }

    // Section Configurations
    function getSectionConfig(section) {
        const configs = {
            'dashboard': {
                title: 'Dashboard',
                subtitle: 'Your music overview',
                render: renderDashboard
            },
            'user-info': {
                title: 'User Profile',
                subtitle: 'Your Last.fm profile information',
                render: renderUserInfo
            },
            'recent-tracks': {
                title: 'Recent Tracks',
                subtitle: 'Your listening history',
                render: renderRecentTracks
            },
            'top-artists': {
                title: 'Top Artists',
                subtitle: 'Your most listened artists',
                render: renderTopArtists
            },
            'top-albums': {
                title: 'Top Albums',
                subtitle: 'Your most played albums',
                render: renderTopAlbums
            },
            'top-tracks': {
                title: 'Top Tracks',
                subtitle: 'Your favorite songs',
                render: renderTopTracks
            },
            'loved-tracks': {
                title: 'Loved Tracks',
                subtitle: 'Tracks you have loved',
                render: renderLovedTracks
            },
            'artist-search': {
                title: 'Artist Search',
                subtitle: 'Search for artists',
                render: renderArtistSearch
            },
            'track-search': {
                title: 'Track Search',
                subtitle: 'Search for tracks',
                render: renderTrackSearch
            },
            'album-search': {
                title: 'Album Search',
                subtitle: 'Search for albums',
                render: renderAlbumSearch
            },
            'chart-artists': {
                title: 'Chart: Top Artists',
                subtitle: 'Global top artists',
                render: renderChartArtists
            },
            'chart-tracks': {
                title: 'Chart: Top Tracks',
                subtitle: 'Global top tracks',
                render: renderChartTracks
            },
            'geo-charts': {
                title: 'Charts by Country',
                subtitle: 'Top music by location',
                render: renderGeoCharts
            },
            'top-tags': {
                title: 'Top Tags',
                subtitle: 'Popular music tags and genres',
                render: renderTopTags
            },
            'tag-explore': {
                title: 'Explore by Tag',
                subtitle: 'Discover music by genre',
                render: renderTagExplore
            }
        };

        return configs[section] || configs['dashboard'];
    }

    // API Helpers
    async function fetchAPI(endpoint, params = {}) {
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`/api/${endpoint}?${queryParams}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    }

    // Render Functions
    async function renderDashboard() {
        try {
            const [userInfo, recentTracks, topArtists, topTracks] = await Promise.all([
                fetchAPI('user/info', { user: state.currentUser }),
                fetchAPI('user/recent-tracks', { user: state.currentUser, limit: 5 }),
                fetchAPI('user/top-artists', { user: state.currentUser, period: '7day', limit: 5 }),
                fetchAPI('user/top-tracks', { user: state.currentUser, period: '7day', limit: 5 })
            ]);

            const user = userInfo.user;
            const playcount = parseInt(user.playcount || 0).toLocaleString();
            const artistCount = parseInt(user.artist_count || 0).toLocaleString();
            const trackCount = parseInt(user.track_count || 0).toLocaleString();

            // Update now playing
            updateNowPlaying(recentTracks);

            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-play"></i></div>
                        <div class="stat-value">${playcount}</div>
                        <div class="stat-label">Total Scrobbles</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-value">${artistCount}</div>
                        <div class="stat-label">Artists</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-music"></i></div>
                        <div class="stat-value">${trackCount}</div>
                        <div class="stat-label">Tracks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                        <div class="stat-value">${formatDate(user.registered?.unixtime)}</div>
                        <div class="stat-label">Member Since</div>
                    </div>
                </div>

                <div class="data-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-clock"></i> Recent Tracks</h3>
                        </div>
                        <div class="item-list">
                            ${renderTrackList(recentTracks.recenttracks?.track || [], true)}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-star"></i> Top Artists (7 Days)</h3>
                        </div>
                        <div class="item-list">
                            ${renderArtistList(topArtists.topartists?.artist || [])}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderUserInfo() {
        try {
            const userInfo = await fetchAPI('user/info', { user: state.currentUser });
            const user = userInfo.user;
            const avatar = getImage(user.image, 'large') || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1a26" width="100" height="100"/><text x="50" y="50" dominant-baseline="central" text-anchor="middle" fill="%23666" font-size="40">?</text></svg>';

            const apiDocs = renderApiDocs({
                endpoint: '/api/user/info?user=USERNAME',
                params: [
                    { name: 'user', type: 'string', required: true, description: 'The Last.fm username to fetch info for' }
                ],
                code: `// Fetch user information
const response = await fetch('/api/user/info?user=${state.currentUser}');
const data = await response.json();

console.log(data.user.name);      // Username
console.log(data.user.playcount); // Total scrobbles
console.log(data.user.country);   // User country`,
                curl: `curl "http://localhost:3000/api/user/info?user=${state.currentUser}"`
            });

            return `
                <div class="user-profile">
                    <div class="user-avatar">
                        <img src="${avatar}" alt="${user.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231a1a26%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2240%22>?</text></svg>'">
                    </div>
                    <div class="user-details">
                        <h2>${user.name}</h2>
                        ${user.realname ? `<p class="user-real-name">${user.realname}</p>` : ''}
                        <div class="user-meta">
                            <div class="user-meta-item">
                                <div class="user-meta-value">${parseInt(user.playcount || 0).toLocaleString()}</div>
                                <div class="user-meta-label">Scrobbles</div>
                            </div>
                            <div class="user-meta-item">
                                <div class="user-meta-value">${parseInt(user.artist_count || 0).toLocaleString()}</div>
                                <div class="user-meta-label">Artists</div>
                            </div>
                            <div class="user-meta-item">
                                <div class="user-meta-value">${parseInt(user.album_count || 0).toLocaleString()}</div>
                                <div class="user-meta-label">Albums</div>
                            </div>
                            <div class="user-meta-item">
                                <div class="user-meta-value">${parseInt(user.track_count || 0).toLocaleString()}</div>
                                <div class="user-meta-label">Tracks</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-info-circle"></i> Profile Details</h3>
                    </div>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Country</span>
                            <span class="detail-value">${user.country || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Member Since</span>
                            <span class="detail-value">${formatDate(user.registered?.unixtime)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Profile URL</span>
                            <a href="${user.url}" target="_blank" rel="noopener" class="detail-link">
                                <i class="fas fa-external-link-alt"></i> View on Last.fm
                            </a>
                        </div>
                    </div>
                </div>

                ${apiDocs}
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderRecentTracks() {
        try {
            const data = await fetchAPI('user/recent-tracks', { user: state.currentUser, limit: 50 });
            const tracks = data.recenttracks?.track || [];

            updateNowPlaying(data);

            const apiDocs = renderApiDocs({
                endpoint: '/api/user/recent-tracks',
                params: [
                    { name: 'user', type: 'string', required: true, description: 'The Last.fm username' },
                    { name: 'limit', type: 'number', required: false, description: 'Number of tracks to return (default: 10)' },
                    { name: 'page', type: 'number', required: false, description: 'Page number for pagination' }
                ],
                code: `// Fetch recent tracks
const response = await fetch('/api/user/recent-tracks?user=${state.currentUser}&limit=10');
const data = await response.json();

// Check for now playing
const nowPlaying = data.recenttracks.track.find(
    t => t['@attr']?.nowplaying === 'true'
);`,
                curl: `curl "http://localhost:3000/api/user/recent-tracks?user=${state.currentUser}&limit=10"`
            });

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-clock"></i> Recent Tracks</h3>
                    </div>
                    <div class="item-list scrollable">
                        ${renderTrackList(tracks, true)}
                    </div>
                </div>
                ${apiDocs}
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderTopArtists() {
        try {
            const data = await fetchAPI('user/top-artists', { user: state.currentUser, period: 'overall', limit: 50 });
            const artists = data.topartists?.artist || [];

            const apiDocs = renderApiDocs({
                endpoint: '/api/user/top-artists',
                params: [
                    { name: 'user', type: 'string', required: true, description: 'The Last.fm username' },
                    { name: 'period', type: 'string', required: false, description: 'Time period: overall, 7day, 1month, 3month, 6month, 12month' },
                    { name: 'limit', type: 'number', required: false, description: 'Number of artists to return (default: 10)' }
                ],
                code: `// Fetch top artists for the last 7 days
const response = await fetch('/api/user/top-artists?user=${state.currentUser}&period=7day&limit=10');
const data = await response.json();

data.topartists.artist.forEach(artist => {
    console.log(artist.name, artist.playcount);
});`,
                curl: `curl "http://localhost:3000/api/user/top-artists?user=${state.currentUser}&period=overall&limit=10"`
            });

            return `
                <div class="period-filter">
                    <select id="periodFilter" class="filter-select">
                        <option value="overall" selected>All Time</option>
                        <option value="7day">Last 7 Days</option>
                        <option value="1month">Last Month</option>
                        <option value="3month">Last 3 Months</option>
                        <option value="6month">Last 6 Months</option>
                        <option value="12month">Last Year</option>
                    </select>
                </div>
                <div class="card" id="artistsCard">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-star"></i> Top Artists</h3>
                    </div>
                    <div class="data-grid">
                        ${renderArtistCards(artists)}
                    </div>
                </div>
                ${apiDocs}
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderTopAlbums() {
        try {
            const data = await fetchAPI('user/top-albums', { user: state.currentUser, period: 'overall', limit: 50 });
            const albums = data.topalbums?.album || [];

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-compact-disc"></i> Top Albums</h3>
                    </div>
                    <div class="data-grid">
                        ${renderAlbumCards(albums)}
                    </div>
                </div>
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderTopTracks() {
        try {
            const data = await fetchAPI('user/top-tracks', { user: state.currentUser, period: 'overall', limit: 50 });
            const tracks = data.toptracks?.track || [];

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-music"></i> Top Tracks</h3>
                    </div>
                    <div class="item-list scrollable">
                        ${renderTrackList(tracks, false)}
                    </div>
                </div>
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderLovedTracks() {
        try {
            const data = await fetchAPI('user/loved-tracks', { user: state.currentUser, limit: 50 });
            const tracks = data.lovedtracks?.track || [];

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-heart"></i> Loved Tracks</h3>
                    </div>
                    <div class="item-list scrollable">
                        ${tracks.map((track, index) => `
                            <div class="item-card">
                                <div class="item-image">
                                    ${getTrackImage(track)}
                                </div>
                                <div class="item-info">
                                    <div class="item-rank">#${index + 1}</div>
                                    <div class="item-name">${escapeHtml(track.name)}</div>
                                    <div class="item-artist">${escapeHtml(track.artist?.name || track.artist)}</div>
                                </div>
                            </div>
                        `).join('') || '<div class="empty-state"><i class="fas fa-heart-broken"></i><p>No loved tracks found</p></div>'}
                    </div>
                </div>
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderArtistSearch() {
        return `
            <div class="search-box">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="artistSearchInput" class="search-input" placeholder="Search for an artist...">
                </div>
                <button id="artistSearchBtn" class="search-btn">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
            <div id="searchResults" class="search-results"></div>
        `;
    }

    async function renderTrackSearch() {
        return `
            <div class="search-box">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="trackSearchInput" class="search-input" placeholder="Search for a track...">
                </div>
                <button id="trackSearchBtn" class="search-btn">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
            <div id="searchResults" class="search-results"></div>
        `;
    }

    async function renderAlbumSearch() {
        return `
            <div class="search-box">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="albumSearchInput" class="search-input" placeholder="Search for an album...">
                </div>
                <button id="albumSearchBtn" class="search-btn">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
            <div id="searchResults" class="search-results"></div>
        `;
    }

    async function renderChartArtists() {
        try {
            const data = await fetchAPI('chart/top-artists', { limit: 50 });
            const artists = data.artists?.artist || [];

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-bar"></i> Global Top Artists</h3>
                    </div>
                    <div class="data-grid">
                        ${renderArtistCards(artists)}
                    </div>
                </div>
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderChartTracks() {
        try {
            const data = await fetchAPI('chart/top-tracks', { limit: 50 });
            const tracks = data.tracks?.track || [];

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-chart-line"></i> Global Top Tracks</h3>
                    </div>
                    <div class="item-list scrollable">
                        ${renderTrackList(tracks, false)}
                    </div>
                </div>
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderGeoCharts() {
        return `
            <div class="search-box">
                <div class="search-input-wrapper">
                    <i class="fas fa-globe search-icon"></i>
                    <input type="text" id="countryInput" class="search-input" placeholder="Enter country name (e.g., United States, Japan)..." value="United States">
                </div>
                <button id="geoSearchBtn" class="search-btn">
                    <i class="fas fa-search"></i> Get Charts
                </button>
            </div>
            <div id="geoResults" class="geo-results">
                <div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
            </div>
        `;
    }

    async function renderTopTags() {
        try {
            const data = await fetchAPI('tag/top');
            const tags = data.toptags?.tag?.slice(0, 50) || [];

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-tags"></i> Popular Tags</h3>
                    </div>
                    <div class="tags-cloud">
                        ${tags.map(tag => `
                            <span class="tag-item" data-tag="${escapeHtml(tag.name)}">
                                <i class="fas fa-tag"></i> ${escapeHtml(tag.name)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            return renderError(error.message);
        }
    }

    async function renderTagExplore() {
        return `
            <div class="search-box">
                <div class="search-input-wrapper">
                    <i class="fas fa-tag search-icon"></i>
                    <input type="text" id="tagInput" class="search-input" placeholder="Enter a tag/genre (e.g., rock, electronic, jazz)...">
                </div>
                <button id="tagSearchBtn" class="search-btn">
                    <i class="fas fa-search"></i> Explore
                </button>
            </div>
            <div id="tagResults" class="tag-results"></div>
        `;
    }

    // Helper Render Functions
    function renderTrackList(tracks, showNowPlaying = false) {
        if (!tracks.length) {
            return '<div class="empty-state"><i class="fas fa-music"></i><p>No tracks found</p></div>';
        }

        return tracks.map((track, index) => {
            const isNowPlaying = showNowPlaying && track['@attr']?.nowplaying === 'true';
            const playcount = track.playcount ? parseInt(track.playcount).toLocaleString() : null;

            return `
                <div class="item-card ${isNowPlaying ? 'now-playing' : ''}">
                    <div class="item-image">
                        ${getTrackImage(track)}
                    </div>
                    <div class="item-info">
                        ${isNowPlaying ? '<span class="now-playing-badge"><i class="fas fa-broadcast-tower"></i> Now Playing</span>' : `<div class="item-rank">#${index + 1}</div>`}
                        <div class="item-name">${escapeHtml(track.name)}</div>
                        <div class="item-artist">${escapeHtml(track.artist?.['#text'] || track.artist?.name || track.artist || '')}</div>
                        ${playcount ? `<div class="item-stats"><span class="item-stat"><i class="fas fa-play"></i> <span class="value">${playcount}</span></span></div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderArtistList(artists) {
        if (!artists.length) {
            return '<div class="empty-state"><i class="fas fa-user"></i><p>No artists found</p></div>';
        }

        return artists.map((artist, index) => {
            const playcount = artist.playcount ? parseInt(artist.playcount).toLocaleString() : null;
            const image = getImage(artist.image, 'medium');

            return `
                <div class="item-card">
                    <div class="item-image">
                        ${image ? `<img src="${image}" alt="${escapeHtml(artist.name)}" loading="lazy">` : `<div class="item-placeholder"><i class="fas fa-user"></i></div>`}
                    </div>
                    <div class="item-info">
                        <div class="item-rank">#${index + 1}</div>
                        <div class="item-name">${escapeHtml(artist.name)}</div>
                        ${playcount ? `<div class="item-stats"><span class="item-stat"><i class="fas fa-play"></i> <span class="value">${playcount}</span></span></div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderArtistCards(artists) {
        if (!artists.length) {
            return '<div class="empty-state"><i class="fas fa-user"></i><p>No artists found</p></div>';
        }

        return artists.map((artist, index) => {
            const playcount = artist.playcount ? parseInt(artist.playcount).toLocaleString() : null;
            const listeners = artist.listeners ? parseInt(artist.listeners).toLocaleString() : null;
            const image = getImage(artist.image, 'large');

            return `
                <div class="item-card">
                    <div class="item-image">
                        ${image ? `<img src="${image}" alt="${escapeHtml(artist.name)}" loading="lazy">` : `<div class="item-placeholder"><i class="fas fa-user"></i></div>`}
                    </div>
                    <div class="item-info">
                        <div class="item-rank">#${index + 1}</div>
                        <div class="item-name">${escapeHtml(artist.name)}</div>
                        <div class="item-stats">
                            ${playcount ? `<span class="item-stat"><i class="fas fa-play"></i> <span class="value">${playcount}</span></span>` : ''}
                            ${listeners ? `<span class="item-stat"><i class="fas fa-headphones"></i> <span class="value">${listeners}</span></span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderAlbumCards(albums) {
        if (!albums.length) {
            return '<div class="empty-state"><i class="fas fa-compact-disc"></i><p>No albums found</p></div>';
        }

        return albums.map((album, index) => {
            const playcount = album.playcount ? parseInt(album.playcount).toLocaleString() : null;
            const image = getImage(album.image, 'large');

            return `
                <div class="item-card">
                    <div class="item-image">
                        ${image ? `<img src="${image}" alt="${escapeHtml(album.name)}" loading="lazy">` : `<div class="item-placeholder"><i class="fas fa-compact-disc"></i></div>`}
                    </div>
                    <div class="item-info">
                        <div class="item-rank">#${index + 1}</div>
                        <div class="item-name">${escapeHtml(album.name)}</div>
                        <div class="item-artist">${escapeHtml(album.artist?.name || album.artist)}</div>
                        ${playcount ? `<div class="item-stats"><span class="item-stat"><i class="fas fa-play"></i> <span class="value">${playcount}</span></span></div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderError(message) {
        return `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Something went wrong</h3>
                <p>${escapeHtml(message)}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }

    // Utility Functions
    function getImage(images, size = 'large') {
        if (!images || !Array.isArray(images)) return null;
        const sizeMap = { small: 0, medium: 1, large: 2, extralarge: 3, mega: 4 };
        const index = sizeMap[size] || 2;
        const image = images[index] || images[images.length - 1];
        const src = image?.['#text'] || image;
        return src && src.length > 0 ? src : null;
    }

    function getTrackImage(track) {
        const image = getImage(track.image, 'medium');
        if (image) {
            return `<img src="${image}" alt="${escapeHtml(track.name)}" loading="lazy">`;
        }
        return `<div class="item-placeholder"><i class="fas fa-music"></i></div>`;
    }

    function formatDate(unixTimestamp) {
        if (!unixTimestamp) return 'Unknown';
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showLoading() {
        elements.contentWrapper.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>Loading...</p>
            </div>
        `;
    }

    function updateNowPlaying(data) {
        const tracks = data.recenttracks?.track || [];
        const nowPlaying = tracks.find(t => t['@attr']?.nowplaying === 'true');

        if (nowPlaying) {
            elements.nowPlayingText.innerHTML = `<i class="fas fa-music"></i> ${escapeHtml(nowPlaying.name)} - ${escapeHtml(nowPlaying.artist?.['#text'] || nowPlaying.artist)}`;
            document.getElementById('nowPlaying').classList.add('active');
        } else if (tracks.length > 0) {
            elements.nowPlayingText.innerHTML = `<i class="fas fa-clock"></i> Last: ${escapeHtml(tracks[0].name)}`;
            document.getElementById('nowPlaying').classList.remove('active');
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${escapeHtml(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Event Delegation for Dynamic Elements
    document.addEventListener('click', async (e) => {
        // Artist Search
        if (e.target.id === 'artistSearchBtn' || e.target.closest('#artistSearchBtn')) {
            const input = document.getElementById('artistSearchInput');
            if (input?.value.trim()) {
                searchArtists(input.value.trim());
            }
        }

        // Track Search
        if (e.target.id === 'trackSearchBtn' || e.target.closest('#trackSearchBtn')) {
            const input = document.getElementById('trackSearchInput');
            if (input?.value.trim()) {
                searchTracks(input.value.trim());
            }
        }

        // Album Search
        if (e.target.id === 'albumSearchBtn' || e.target.closest('#albumSearchBtn')) {
            const input = document.getElementById('albumSearchInput');
            if (input?.value.trim()) {
                searchAlbums(input.value.trim());
            }
        }

        // Geo Search
        if (e.target.id === 'geoSearchBtn' || e.target.closest('#geoSearchBtn')) {
            const input = document.getElementById('countryInput');
            if (input?.value.trim()) {
                loadGeoCharts(input.value.trim());
            }
        }

        // Tag Search
        if (e.target.id === 'tagSearchBtn' || e.target.closest('#tagSearchBtn')) {
            const input = document.getElementById('tagInput');
            if (input?.value.trim()) {
                exploreTag(input.value.trim());
            }
        }

        // Tag Click
        if (e.target.classList.contains('tag-item') || e.target.closest('.tag-item')) {
            const tagElement = e.target.classList.contains('tag-item') ? e.target : e.target.closest('.tag-item');
            const tagName = tagElement.dataset.tag;
            if (tagName) {
                // Navigate to tag explore section
                const tagExploreNav = document.querySelector('[data-section="tag-explore"]');
                if (tagExploreNav) {
                    setActiveNavItem(tagExploreNav);
                    loadSection('tag-explore').then(() => {
                        const input = document.getElementById('tagInput');
                        if (input) {
                            input.value = tagName;
                            exploreTag(tagName);
                        }
                    });
                }
            }
        }
    });

    // Search Functions
    async function searchArtists(query) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

        try {
            const data = await fetchAPI('artist/search', { artist: query, limit: 20 });
            const artists = data.results?.artistmatches?.artist || [];

            resultsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-search"></i> Results for "${escapeHtml(query)}"</h3>
                    </div>
                    <div class="data-grid">
                        ${renderArtistCards(artists)}
                    </div>
                </div>
            `;
        } catch (error) {
            resultsContainer.innerHTML = renderError(error.message);
        }
    }

    async function searchTracks(query) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

        try {
            const data = await fetchAPI('track/search', { track: query, limit: 20 });
            const tracks = data.results?.trackmatches?.track || [];

            resultsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-search"></i> Results for "${escapeHtml(query)}"</h3>
                    </div>
                    <div class="item-list scrollable">
                        ${renderTrackList(tracks, false)}
                    </div>
                </div>
            `;
        } catch (error) {
            resultsContainer.innerHTML = renderError(error.message);
        }
    }

    async function searchAlbums(query) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

        try {
            const data = await fetchAPI('album/search', { album: query, limit: 20 });
            const albums = data.results?.albummatches?.album || [];

            resultsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-search"></i> Results for "${escapeHtml(query)}"</h3>
                    </div>
                    <div class="data-grid">
                        ${renderAlbumCards(albums)}
                    </div>
                </div>
            `;
        } catch (error) {
            resultsContainer.innerHTML = renderError(error.message);
        }
    }

    async function loadGeoCharts(country) {
        const resultsContainer = document.getElementById('geoResults');
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading charts for ' + escapeHtml(country) + '...</div>';

        try {
            const [artistData, trackData] = await Promise.all([
                fetchAPI('geo/top-artists', { country, limit: 10 }),
                fetchAPI('geo/top-tracks', { country, limit: 10 })
            ]);

            const artists = artistData.topartists?.artist || [];
            const tracks = trackData.tracks?.track || [];

            resultsContainer.innerHTML = `
                <div class="data-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-star"></i> Top Artists in ${escapeHtml(country)}</h3>
                        </div>
                        <div class="item-list">
                            ${renderArtistList(artists)}
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-music"></i> Top Tracks in ${escapeHtml(country)}</h3>
                        </div>
                        <div class="item-list">
                            ${renderTrackList(tracks, false)}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            resultsContainer.innerHTML = renderError(error.message);
        }
    }

    async function exploreTag(tag) {
        const resultsContainer = document.getElementById('tagResults');
        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Exploring ' + escapeHtml(tag) + '...</div>';

        try {
            const [artistData, trackData] = await Promise.all([
                fetchAPI('tag/top-artists', { tag, limit: 10 }),
                fetchAPI('tag/top-tracks', { tag, limit: 10 })
            ]);

            const artists = artistData.topartists?.artist || [];
            const tracks = trackData.tracks?.track || [];

            resultsContainer.innerHTML = `
                <div class="data-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-star"></i> Top ${escapeHtml(tag)} Artists</h3>
                        </div>
                        <div class="item-list">
                            ${renderArtistList(artists)}
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-music"></i> Top ${escapeHtml(tag)} Tracks</h3>
                        </div>
                        <div class="item-list">
                            ${renderTrackList(tracks, false)}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            resultsContainer.innerHTML = renderError(error.message);
        }
    }

    // Keyboard Event Delegation
    document.addEventListener('keypress', (e) => {
        if (e.key !== 'Enter') return;

        const target = e.target;

        if (target.id === 'artistSearchInput') {
            document.getElementById('artistSearchBtn')?.click();
        } else if (target.id === 'trackSearchInput') {
            document.getElementById('trackSearchBtn')?.click();
        } else if (target.id === 'albumSearchInput') {
            document.getElementById('albumSearchBtn')?.click();
        } else if (target.id === 'countryInput') {
            document.getElementById('geoSearchBtn')?.click();
        } else if (target.id === 'tagInput') {
            document.getElementById('tagSearchBtn')?.click();
        }
    });

    // Auto-load geo charts on page load
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const geoResults = document.getElementById('geoResults');
            if (geoResults) {
                loadGeoCharts('United States');
            }
        }, 100);
    });

    // Initialize app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
