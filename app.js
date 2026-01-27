// ReputedMochi - Multi-Page Web3 App with Routing
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

// Contract Address
const CONTRACT_ADDRESS = '0xBA5f185087B609405f1762C618895E271213A95B';

// GenLayer Network
const GENLAYER_NETWORK = {
    chainId: '0xf22f',
    chainName: 'GenLayer Studio',
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
    rpcUrls: ['https://studio.genlayer.com/api']
};

// Global State
let client = null;
let currentAccount = null;
let currentPage = 'home';
let currentProjectName = null;
let allProjects = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupRouting();
    checkWalletConnection();
    updateContractAddress();
});

// Setup Event Listeners
function setupEventListeners() {
    // Wallet
    document.getElementById('connectWalletBtn')?.addEventListener('click', connectWallet);
    document.getElementById('disconnectBtn')?.addEventListener('click', disconnectWallet);
    document.getElementById('addNetworkBtn')?.addEventListener('click', () => {
        document.getElementById('networkModal').classList.add('active');
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    // Profile tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchProfileTab(tab);
        });
    });

    // Filters
    document.getElementById('projectSearch')?.addEventListener('input', filterProjects);
    document.getElementById('categoryFilter')?.addEventListener('change', filterProjects);
    document.getElementById('sortFilter')?.addEventListener('change', filterProjects);

    // MetaMask events
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }
}

// Routing System
function setupRouting() {
    // Handle hash changes
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
}

function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const [page, ...params] = hash.split('/');
    
    if (page === 'project' && params[0]) {
        navigateTo('project-detail', params[0]);
    } else {
        navigateTo(page);
    }
}

function navigateTo(page, param = null) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Show target page
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = page;
        
        // Load page-specific data
        loadPageData(page, param);
        
        // Update URL
        if (page === 'project-detail' && param) {
            window.location.hash = `project/${param}`;
        } else {
            window.location.hash = page;
        }
    }
}

window.navigateTo = navigateTo;

function loadPageData(page, param) {
    switch(page) {
        case 'home':
            loadHomePage();
            break;
        case 'projects':
            loadProjectsPage();
            break;
        case 'project-detail':
            if (param) loadProjectDetail(param);
            break;
        case 'profile':
            loadProfilePage();
            break;
    }
}

// Wallet Connection
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showToast('Please install MetaMask', 'error');
            return;
        }

        showLoading('Connecting wallet...');

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) throw new Error('No accounts found');

        currentAccount = accounts[0];

        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== GENLAYER_NETWORK.chainId) {
            await switchToGenLayer();
        }

        // Initialize client
        client = createClient({ chain: studionet, account: currentAccount });

        updateWalletUI();
        await loadDashboard();
        
        // Reload current page data
        loadPageData(currentPage);

        showToast('Wallet connected!', 'success');
        hideLoading();

    } catch (error) {
        console.error('Connection error:', error);
        showToast(`Connection failed: ${error.message}`, 'error');
        hideLoading();
    }
}

async function switchToGenLayer() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: GENLAYER_NETWORK.chainId }]
        });
    } catch (error) {
        if (error.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [GENLAYER_NETWORK]
            });
        } else {
            throw error;
        }
    }
}

window.addGenLayerNetwork = async function() {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [GENLAYER_NETWORK]
        });
        showToast('GenLayer network added!', 'success');
        closeNetworkModal();
    } catch (error) {
        showToast(`Failed: ${error.message}`, 'error');
    }
}

function disconnectWallet() {
    currentAccount = null;
    client = null;
    updateWalletUI();
    showToast('Wallet disconnected', 'success');
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        disconnectWallet();
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        client = createClient({ chain: studionet, account: currentAccount });
        updateWalletUI();
        loadDashboard();
        loadPageData(currentPage);
    }
}

function updateWalletUI() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletInfo = document.getElementById('walletInfo');

    if (currentAccount) {
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'flex';
        document.getElementById('walletAddress').textContent = 
            `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
    } else {
        connectBtn.style.display = 'block';
        walletInfo.style.display = 'none';
    }
}

async function checkWalletConnection() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            currentAccount = accounts[0];
            client = createClient({ chain: studionet, account: currentAccount });
            updateWalletUI();
            await loadDashboard();
            loadPageData(currentPage);
        }
    }
}

// Dashboard
async function loadDashboard() {
    if (!client || !currentAccount) return;

    try {
        const dashboard = await callContractRead('get_my_dashboard', [currentAccount]);
        console.log('Dashboard:', dashboard);

        const getVal = (key) => Number(dashboard instanceof Map ? dashboard.get(key) : dashboard[key] || 0);

        document.getElementById('balance').textContent = getVal('balance');
        document.getElementById('reviewsPossible').textContent = getVal('reviews_possible');
        document.getElementById('totalReviews').textContent = getVal('total_reviews');
        document.getElementById('approvedReviews').textContent = getVal('approved_reviews');
        document.getElementById('flaggedReviews').textContent = getVal('flagged_reviews');
        document.getElementById('totalDeposited').textContent = getVal('total_deposited');
        document.getElementById('totalRefunded').textContent = getVal('total_refunded');
        document.getElementById('totalSlashed').textContent = getVal('total_slashed');
        document.getElementById('netEarnings').textContent = getVal('net_earnings');

        // Show dashboard content (only if on profile page)
        const dashboardEl = document.getElementById('dashboardContent');
        if (dashboardEl) {
            dashboardEl.style.display = 'block';
        }

    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// Home Page
async function loadHomePage() {
    // Can load public data even without wallet
    try {
        // If no client, create a temporary read-only one
        let readClient = client;
        if (!readClient) {
            readClient = createClient({ chain: studionet });
        }
        
        // Load stats
        const stats = await readClient.readContract({
            address: CONTRACT_ADDRESS,
            functionName: 'get_stats',
            args: []
        });
        const getVal = (key) => Number(stats instanceof Map ? stats.get(key) : stats[key] || 0);
        
        document.getElementById('totalProjectsHome').textContent = getVal('total_projects');
        document.getElementById('totalReviewsHome').textContent = getVal('total_reviews');

        // Load top projects
        const projects = await readClient.readContract({
            address: CONTRACT_ADDRESS,
            functionName: 'get_all_projects',
            args: []
        });
        allProjects = projects || [];
        
        const topProjects = [...allProjects]
            .sort((a, b) => {
                const scoreA = Number(a instanceof Map ? a.get('reputation_score') : a.reputation_score || 0);
                const scoreB = Number(b instanceof Map ? b.get('reputation_score') : b.reputation_score || 0);
                return scoreB - scoreA;
            })
            .slice(0, 6);

        displayProjects(topProjects, 'topProjectsList');

        // Load recent reviews from all projects
        await loadRecentReviews(readClient);

    } catch (error) {
        console.error('Home page error:', error);
        document.getElementById('topProjectsList').innerHTML = '<p class="empty-state">Failed to load projects. Please refresh.</p>';
    }
}

async function loadRecentReviews(readClient) {
    try {
        // Get reviews from all projects
        let allReviews = [];
        
        for (const project of allProjects.slice(0, 5)) { // Only check first 5 projects for performance
            const getVal = (key) => project instanceof Map ? project.get(key) : project[key];
            const projectName = getVal('name');
            
            if (projectName) {
                const reviews = await readClient.readContract({
                    address: CONTRACT_ADDRESS,
                    functionName: 'get_reviews',
                    args: [projectName, 5]
                });
                
                if (reviews && reviews.length > 0) {
                    allReviews = allReviews.concat(reviews);
                }
            }
        }
        
        // Sort by timestamp (most recent first) and take top 5
        const recentReviews = allReviews
            .sort((a, b) => {
                const timeA = a instanceof Map ? a.get('timestamp') : a.timestamp;
                const timeB = b instanceof Map ? b.get('timestamp') : b.timestamp;
                return new Date(timeB) - new Date(timeA);
            })
            .slice(0, 5);
        
        if (recentReviews.length === 0) {
            document.getElementById('recentReviewsList').innerHTML = '<p class="empty-state">No reviews yet. Be the first to review a project!</p>';
        } else {
            displayReviews(recentReviews, 'recentReviewsList');
        }
        
    } catch (error) {
        console.error('Recent reviews error:', error);
        document.getElementById('recentReviewsList').innerHTML = '<p class="empty-state">Failed to load recent reviews</p>';
    }
}

// Projects Page
async function loadProjectsPage() {
    try {
        // Can load public data even without wallet
        let readClient = client;
        if (!readClient) {
            readClient = createClient({ chain: studionet });
        }
        
        const projects = await readClient.readContract({
            address: CONTRACT_ADDRESS,
            functionName: 'get_all_projects',
            args: []
        });
        allProjects = projects || [];
        filterProjects();
    } catch (error) {
        console.error('Projects page error:', error);
        document.getElementById('projectsListFull').innerHTML = '<p class="empty-state">Failed to load projects. Please connect wallet and refresh.</p>';
    }
}

function filterProjects() {
    const search = document.getElementById('projectSearch')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || 'rating';

    let filtered = [...allProjects].filter(project => {
        const getVal = (key) => project instanceof Map ? project.get(key) : project[key];
        const name = String(getVal('name') || '').toLowerCase();
        const cat = String(getVal('category') || '');
        
        const matchesSearch = !search || name.includes(search);
        const matchesCategory = !category || cat === category;
        
        return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
        const getVal = (p, key) => Number(p instanceof Map ? p.get(key) : p[key] || 0);
        
        if (sort === 'rating') {
            return getVal(b, 'reputation_score') - getVal(a, 'reputation_score');
        } else if (sort === 'reviews') {
            return getVal(b, 'total_reviews') - getVal(a, 'total_reviews');
        }
        return 0;
    });

    displayProjects(filtered, 'projectsListFull');
}

async function displayProjects(projects, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="empty-state">No projects found</p>';
        return;
    }

    container.innerHTML = '<p class="loading-text">Loading projects...</p>';

    let html = '';
    for (const project of projects) {
        const getVal = (key) => project instanceof Map ? project.get(key) : project[key];
        
        const name = getVal('name') || 'Unknown';
        const category = getVal('category') || 'Other';
        const score = Number(getVal('reputation_score') || 500);
        const stars = Number(getVal('average_stars') || 30);
        const level = getVal('reputation_level') || 'Average';
        const reviews = Number(getVal('total_reviews') || 0);
        const ownerAddress = getVal('owner') || '';
        
        const avgStars = (stars / 10).toFixed(1);
        const starIcons = '⭐'.repeat(Math.round(stars / 10));
        
        // Get owner username
        const ownerDisplay = await getUserDisplay(ownerAddress);
        const ownerName = ownerDisplay.username || 'Anonymous';

        html += `
            <div class="project-card" onclick="navigateTo('project-detail', '${name}')">
                <div class="project-header">
                    <div>
                        <div class="project-name">${name}</div>
                        <span class="project-category">${category}</span>
                    </div>
                </div>
                <div class="project-owner">
                    <small>👤 By: <span class="owner-name" title="${ownerAddress}">${ownerName}</span></small>
                </div>
                <div class="project-reputation">
                    <span class="reputation-score">${score}/1000</span>
                    <span class="reputation-level">${level}</span>
                </div>
                <div class="project-stats">
                    <span>${starIcons} ${avgStars}/5</span>
                    <span>📝 ${reviews} reviews</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Project Detail Page
async function loadProjectDetail(projectName) {
    currentProjectName = projectName;
    
    try {
        // Can load public data even without wallet
        let readClient = client;
        if (!readClient) {
            readClient = createClient({ chain: studionet });
        }
        
        // Load project info
        const project = await readClient.readContract({
            address: CONTRACT_ADDRESS,
            functionName: 'get_project',
            args: [projectName]
        });
        const getVal = (key) => project instanceof Map ? project.get(key) : project[key];
        
        const name = getVal('name') || projectName;
        const category = getVal('category') || 'Unknown';
        const description = getVal('description') || '';
        const website = getVal('website') || '';
        const score = Number(getVal('reputation_score') || 500);
        const stars = Number(getVal('average_stars') || 30);
        const level = getVal('reputation_level') || 'Average';
        const reviews = Number(getVal('total_reviews') || 0);
        
        const avgStars = (stars / 10).toFixed(1);
        
        document.getElementById('projectDetailContent').innerHTML = `
            <div class="project-detail-header">
                <h2>${name}</h2>
                <span class="project-category">${category}</span>
            </div>
            <p>${description}</p>
            <p><strong>Website:</strong> <a href="${website}" target="_blank">${website}</a></p>
            <div class="project-reputation">
                <div>
                    <div class="reputation-score">${score}/1000</div>
                    <div class="reputation-level">${level}</div>
                </div>
                <div>
                    <div>⭐ ${avgStars}/5</div>
                    <div>📝 ${reviews} reviews</div>
                </div>
            </div>
        `;

        // Load reviews
        const reviewsList = await readClient.readContract({
            address: CONTRACT_ADDRESS,
            functionName: 'get_reviews',
            args: [projectName, 50]
        });
        displayReviews(reviewsList || [], 'projectReviewsList');

    } catch (error) {
        console.error('Project detail error:', error);
        document.getElementById('projectDetailContent').innerHTML = '<p class="empty-state">Failed to load project. Please refresh.</p>';
    }
}

// Profile cache to avoid repeated lookups
const profileCache = new Map();

async function getUserDisplay(address) {
    if (!address) return 'Anonymous';
    
    // Check cache first
    if (profileCache.has(address)) {
        return profileCache.get(address);
    }
    
    try {
        const profile = await callContractRead('get_profile', [address]);
        const getVal = (key) => profile instanceof Map ? profile.get(key) : profile[key];
        
        const hasProfile = getVal('has_profile');
        if (hasProfile) {
            const username = getVal('username');
            const avatarUrl = getVal('avatar_url');
            const result = { username, avatarUrl, address };
            profileCache.set(address, result);
            return result;
        }
    } catch (error) {
        console.error('Error fetching profile for', address, error);
    }
    
    // Fallback: no profile found
    const fallback = { 
        username: shortenAddress(address), 
        avatarUrl: null, 
        address 
    };
    profileCache.set(address, fallback);
    return fallback;
}

async function displayReviews(reviews, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="empty-state">No reviews yet</p>';
        return;
    }

    container.innerHTML = '<p class="loading-text">Loading reviews...</p>';

    let html = '';
    for (const review of reviews) {
        const getVal = (key) => review instanceof Map ? review.get(key) : review[key];
        
        const stars = '⭐'.repeat(Number(getVal('stars')));
        const status = String(getVal('status') || 'approved').toLowerCase();
        const authorAddress = String(getVal('author') || 'Anonymous');
        
        // Get username and avatar
        const userDisplay = await getUserDisplay(authorAddress);
        const username = userDisplay.username || 'Anonymous';
        const avatarUrl = userDisplay.avatarUrl;
        
        // Avatar HTML
        const avatarHtml = avatarUrl 
            ? `<img src="${avatarUrl}" alt="${username}" class="review-avatar">`
            : `<div class="review-avatar-placeholder">👤</div>`;
        
        html += `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-author-section">
                        ${avatarHtml}
                        <div>
                            <div class="review-stars">${stars}</div>
                            <small class="review-author" title="${authorAddress}">${username}</small>
                        </div>
                    </div>
                    <span class="review-status ${status}">${status.toUpperCase()}</span>
                </div>
                <div class="review-text">${getVal('text')}</div>
                <div class="review-meta">
                    <span>👍 ${getVal('helpful_votes')} helpful</span>
                    <span>📊 Quality: ${getVal('quality_score')}/100</span>
                    <span>🕒 ${new Date(getVal('timestamp')).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

window.reviewCurrentProject = async function() {
    if (!currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }
    if (!currentProjectName) return;
    
    document.getElementById('reviewProjectName').value = currentProjectName;
    document.getElementById('reviewModal').classList.add('active');
    
    // Check balance and update UI
    await updateReviewModalBalance();
}

async function updateReviewModalBalance() {
    try {
        const dashboard = await callContractRead('get_my_dashboard', [currentAccount]);
        const getVal = (key) => Number(dashboard instanceof Map ? dashboard.get(key) : dashboard[key] || 0);
        const balance = getVal('balance');
        const reviewStake = 100;
        
        const balanceDisplay = document.getElementById('reviewBalanceDisplay');
        const balanceWarning = document.getElementById('reviewBalanceWarning');
        const balanceInfo = document.getElementById('reviewBalanceInfo');
        const submitBtn = document.getElementById('submitReviewBtn');
        const currentBalanceSpan = document.getElementById('reviewCurrentBalance');
        
        balanceDisplay.textContent = balance;
        currentBalanceSpan.textContent = balance;
        
        if (balance < reviewStake) {
            // Show warning, hide info, disable button
            balanceWarning.style.display = 'block';
            balanceInfo.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.textContent = '❌ Insufficient Balance';
        } else {
            // Hide warning, show info, enable button
            balanceWarning.style.display = 'none';
            balanceInfo.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.textContent = '📝 Submit Review (100 GEN)';
        }
    } catch (error) {
        console.error('Balance check error:', error);
    }
}

// Profile Page
async function loadProfilePage() {
    // Hide all profile sections first
    document.getElementById('profileNotConnected').style.display = 'none';
    document.getElementById('profileSetup').style.display = 'none';
    document.getElementById('profileDisplay').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'none';

    if (!client || !currentAccount) {
        document.getElementById('profileNotConnected').style.display = 'block';
        return;
    }

    try {
        // Check if user has profile
        const hasProfile = await callContractRead('has_profile', [currentAccount]);
        
        if (!hasProfile) {
            // Show profile setup
            document.getElementById('profileSetup').style.display = 'block';
            setupProfileFormListeners();
        } else {
            // Load and display profile
            await loadAndDisplayProfile();
            // Also load dashboard and reviews
            await loadDashboard();
            await loadMyReviews();
        }
    } catch (error) {
        console.error('Profile page error:', error);
        
        // Fallback: If contract doesn't have profile methods, show old dashboard
        if (error.message.includes('running contract failed') || error.message.includes('invalid parameters')) {
            console.log('Contract does not support profiles yet. Showing basic dashboard.');
            showToast('⚠️ Profile features require updated contract deployment', 'warning');
            document.getElementById('profileNotConnected').innerHTML = `
                <h2>👤 My Profile</h2>
                <div class="card">
                    <p style="color: #f39c12; padding: 1rem; background: #fff3cd; border-radius: 8px; margin-bottom: 1rem;">
                        ⚠️ <strong>Profile System Not Available</strong><br>
                        The deployed contract needs to be updated to support user profiles.
                    </p>
                    <p>You can still use the basic dashboard below:</p>
                </div>
            `;
            document.getElementById('profileNotConnected').style.display = 'block';
            await loadDashboard();
            await loadMyReviews();
        } else {
            showToast('Error loading profile', 'error');
        }
    }
}

function setupProfileFormListeners() {
    // Username availability check
    const usernameInput = document.getElementById('setupUsername');
    let checkTimeout;
    
    usernameInput.addEventListener('input', () => {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(async () => {
            const username = usernameInput.value.trim();
            if (username.length >= 3) {
                try {
                    const available = await callContractRead('username_available', [username]);
                    const hint = document.getElementById('usernameAvailability');
                    if (available) {
                        hint.textContent = '✅ Username available';
                        hint.style.color = 'green';
                    } else {
                        hint.textContent = '❌ Username taken';
                        hint.style.color = 'red';
                    }
                } catch (error) {
                    console.error('Username check error:', error);
                }
            }
        }, 500);
    });

    // Bio character count
    const bioInput = document.getElementById('setupBio');
    bioInput.addEventListener('input', () => {
        const count = bioInput.value.length;
        document.getElementById('bioCharCount').textContent = `${count} / 500`;
    });

    // Edit bio character count
    const editBioInput = document.getElementById('editBio');
    if (editBioInput) {
        editBioInput.addEventListener('input', () => {
            const count = editBioInput.value.length;
            document.getElementById('editBioCharCount').textContent = `${count} / 500`;
        });
    }
}

async function loadAndDisplayProfile() {
    try {
        const profile = await callContractRead('get_profile', [currentAccount]);
        
        const getVal = (key) => profile instanceof Map ? profile.get(key) : profile[key];
        
        // Display profile
        const avatarUrl = getVal('avatar_url');
        if (avatarUrl) {
            document.getElementById('profileAvatar').src = avatarUrl;
        }
        document.getElementById('profileUsername').textContent = getVal('username') || 'Anonymous';
        document.getElementById('profileAddress').textContent = shortenAddress(currentAccount);
        document.getElementById('profileJoined').textContent = formatDate(getVal('joined_date'));
        document.getElementById('profileBio').textContent = getVal('bio') || 'No bio yet';
        
        // Display stats
        document.getElementById('profileTotalReviews').textContent = getVal('total_reviews') || 0;
        document.getElementById('profileApprovedReviews').textContent = getVal('approved_reviews') || 0;
        document.getElementById('profileHelpfulVotes').textContent = getVal('helpful_votes') || 0;
        
        // Display social links
        const linksContainer = document.getElementById('profileLinksContainer');
        const twitter = getVal('twitter');
        const github = getVal('github');
        const website = getVal('website');
        
        let linksHtml = '';
        if (twitter) linksHtml += `<a href="https://twitter.com/${twitter.replace('@', '')}" target="_blank">🐦 Twitter: ${twitter}</a>`;
        if (github) linksHtml += `<a href="https://github.com/${github}" target="_blank">🐙 GitHub: ${github}</a>`;
        if (website) linksHtml += `<a href="${website}" target="_blank">🌐 Website</a>`;
        
        if (linksHtml) {
            linksContainer.innerHTML = linksHtml;
        } else {
            linksContainer.innerHTML = '<p class="empty-state">No links added</p>';
        }
        
        document.getElementById('profileDisplay').style.display = 'block';
    } catch (error) {
        console.error('Load profile error:', error);
        showToast('Error loading profile', 'error');
    }
}

function shortenAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

// Profile Management Functions
window.createProfile = async function() {
    if (!client || !currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }

    const username = document.getElementById('setupUsername').value.trim();
    const bio = document.getElementById('setupBio').value.trim();
    const avatarUrl = document.getElementById('setupAvatar').value.trim();
    const twitter = document.getElementById('setupTwitter').value.trim();
    const github = document.getElementById('setupGithub').value.trim();
    const website = document.getElementById('setupWebsite').value.trim();

    if (!username || username.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }

    try {
        showLoading('Creating profile...');

        await callContractWrite('create_profile', [
            currentAccount,
            username,
            bio,
            avatarUrl,
            twitter,
            github,
            website
        ]);

        showLoading('Waiting for confirmation...');
        await waitForStateUpdate(async () => {
            const hasProfile = await callContractRead('has_profile', [currentAccount]);
            return hasProfile;
        });

        hideLoading();
        showToast('Profile created successfully! 🎉', 'success');
        
        // Reload profile page
        await loadProfilePage();
    } catch (error) {
        hideLoading();
        console.error('Create profile error:', error);
        showToast('Error creating profile: ' + error.message, 'error');
    }
}

window.showProfileEditMode = async function() {
    try {
        const profile = await callContractRead('get_profile', [currentAccount]);
        const getVal = (key) => profile instanceof Map ? profile.get(key) : profile[key];

        // Populate edit form
        document.getElementById('editUsername').value = getVal('username') || '';
        document.getElementById('editBio').value = getVal('bio') || '';
        document.getElementById('editAvatar').value = getVal('avatar_url') || '';
        document.getElementById('editTwitter').value = getVal('twitter') || '';
        document.getElementById('editGithub').value = getVal('github') || '';
        document.getElementById('editWebsite').value = getVal('website') || '';

        // Update character count
        const bioCount = (getVal('bio') || '').length;
        document.getElementById('editBioCharCount').textContent = `${bioCount} / 500`;

        // Hide display, show edit
        document.getElementById('profileDisplay').style.display = 'none';
        document.getElementById('profileEdit').style.display = 'block';
    } catch (error) {
        console.error('Show edit mode error:', error);
        showToast('Error loading profile for editing', 'error');
    }
}

window.updateProfile = async function() {
    if (!client || !currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }

    const bio = document.getElementById('editBio').value.trim();
    const avatarUrl = document.getElementById('editAvatar').value.trim();
    const twitter = document.getElementById('editTwitter').value.trim();
    const github = document.getElementById('editGithub').value.trim();
    const website = document.getElementById('editWebsite').value.trim();

    try {
        showLoading('Updating profile...');

        await callContractWrite('update_profile', [
            currentAccount,
            bio,
            avatarUrl,
            twitter,
            github,
            website
        ]);

        showLoading('Waiting for confirmation...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        hideLoading();
        showToast('Profile updated successfully! ✅', 'success');
        
        // Hide edit, reload display
        document.getElementById('profileEdit').style.display = 'none';
        await loadAndDisplayProfile();
        document.getElementById('dashboardContent').style.display = 'block';
    } catch (error) {
        hideLoading();
        console.error('Update profile error:', error);
        showToast('Error updating profile: ' + error.message, 'error');
    }
}

window.cancelProfileEdit = function() {
    document.getElementById('profileEdit').style.display = 'none';
    document.getElementById('profileDisplay').style.display = 'block';
}

function switchProfileTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) btn.classList.add('active');
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');

    if (tab === 'transactions') {
        loadTransactions();
    }
}

async function loadMyReviews() {
    if (!client || !currentAccount) return;

    try {
        const reviews = await callContractRead('get_my_reviews', [currentAccount]);
        displayReviews(reviews || [], 'myReviewsList');
    } catch (error) {
        console.error('My reviews error:', error);
    }
}

async function loadTransactions() {
    if (!client || !currentAccount) return;

    try {
        const transactions = await callContractRead('get_my_transactions', [currentAccount, 50]);
        
        if (!transactions || transactions.length === 0) {
            document.getElementById('transactionsList').innerHTML = '<p class="empty-state">No transactions yet</p>';
            return;
        }

        let html = '';
        for (const tx of transactions) {
            const getVal = (key) => tx instanceof Map ? tx.get(key) : tx[key];
            
            const type = String(getVal('type'));
            const isPositive = type === 'deposit' || type === 'refund';
            const amountClass = isPositive ? 'success' : 'error';
            const sign = isPositive ? '+' : '-';
            
            html += `
                <div class="review-card">
                    <div class="review-header">
                        <div>
                            <strong>${type.toUpperCase()}</strong>
                            <p>${getVal('description')}</p>
                        </div>
                        <span class="stat-value ${amountClass}">${sign}${Number(getVal('amount'))}</span>
                    </div>
                    <small>${new Date(getVal('timestamp')).toLocaleString()}</small>
                </div>
            `;
        }
        
        document.getElementById('transactionsList').innerHTML = html;
    } catch (error) {
        console.error('Transactions error:', error);
    }
}

// Forms
window.depositTokens = async function(event) {
    event.preventDefault();
    
    if (!client || !currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }

    const amount = parseInt(document.getElementById('depositAmount').value);
    
    try {
        showLoading('Depositing tokens...');
        
        await callContractWrite('deposit', [currentAccount, amount]);
        
        closeDepositModal();
        document.getElementById('depositForm').reset();
        
        showLoading('Waiting for update...');
        const oldBalance = document.getElementById('balance').textContent;
        await waitForStateUpdate(async () => {
            await loadDashboard();
            return document.getElementById('balance').textContent !== oldBalance;
        });
        
        hideLoading();
        showToast('Deposit successful!', 'success');
        
    } catch (error) {
        console.error('Deposit error:', error);
        showToast(`Deposit failed: ${error.message}`, 'error');
        hideLoading();
    }
}

window.registerProject = async function(event) {
    event.preventDefault();
    
    if (!client || !currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }

    const name = document.getElementById('projectName').value;
    const category = document.getElementById('projectCategory').value;
    const description = document.getElementById('projectDescription').value;
    const website = document.getElementById('projectWebsite').value;

    try {
        showLoading('Registering project...');
        
        await callContractWrite('register_project', [currentAccount, name, category, description, website]);
        
        document.getElementById('registerForm').reset();
        
        showLoading('Waiting for update...');
        await waitForStateUpdate(async () => {
            await loadProjectsPage();
            return allProjects.some(p => {
                const pName = p instanceof Map ? p.get('name') : p.name;
                return pName === name;
            });
        });
        
        hideLoading();
        showToast('Project registered!', 'success');
        navigateTo('projects');
        
    } catch (error) {
        console.error('Register error:', error);
        showToast(`Registration failed: ${error.message}`, 'error');
        hideLoading();
    }
}

window.submitReview = async function(event) {
    event.preventDefault();
    
    if (!client || !currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }

    const projectName = document.getElementById('reviewProjectName').value;
    const rating = document.querySelector('input[name="rating"]:checked');
    
    if (!rating) {
        showToast('Please select a rating', 'error');
        return;
    }
    
    const text = document.getElementById('reviewText').value;

    try {
        // First check balance
        showLoading('Checking balance...');
        const dashboard = await callContractRead('get_my_dashboard', [currentAccount]);
        const getVal = (key) => Number(dashboard instanceof Map ? dashboard.get(key) : dashboard[key] || 0);
        const balance = getVal('balance');
        const reviewStake = 100; // 100 GEN per review
        
        if (balance < reviewStake) {
            hideLoading();
            showToast(`Insufficient balance! You need ${reviewStake} GEN to submit a review. Current balance: ${balance} GEN`, 'error');
            
            // Show deposit prompt
            if (confirm(`You need ${reviewStake - balance} more GEN to submit a review. Would you like to deposit now?`)) {
                closeReviewModal();
                openDepositModal();
            }
            return;
        }
        
        showLoading('Checking project...');
        
        const exists = await callContractRead('project_exists', [projectName]);
        if (!exists) {
            hideLoading();
            showToast(`Project "${projectName}" not found`, 'error');
            return;
        }
        
        showLoading('Submitting review...');
        
        await callContractWrite('submit_review', [currentAccount, projectName, parseInt(rating.value), text]);
        
        closeReviewModal();
        document.getElementById('reviewForm').reset();
        
        showLoading('Waiting for update...');
        const oldCount = document.getElementById('totalReviews').textContent;
        await waitForStateUpdate(async () => {
            await loadDashboard();
            await loadMyReviews();
            return document.getElementById('totalReviews').textContent !== oldCount;
        });
        
        hideLoading();
        showToast('Review submitted!', 'success');
        navigateTo('profile');
        
    } catch (error) {
        console.error('Review error:', error);
        showToast(`Submission failed: ${error.message}`, 'error');
        hideLoading();
    }
}

// Contract Helpers
async function callContractRead(method, args) {
    try {
        const result = await client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: method,
            args: args
        });
        return result;
    } catch (error) {
        console.error(`Read ${method} error:`, error);
        throw error;
    }
}

async function callContractWrite(method, args) {
    try {
        const result = await client.writeContract({
            address: CONTRACT_ADDRESS,
            functionName: method,
            args: args
        });
        return result;
    } catch (error) {
        console.error(`Write ${method} error:`, error);
        throw error;
    }
}

async function waitForStateUpdate(checkFunction, maxAttempts = 10, delayMs = 500) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const result = await checkFunction();
            if (result) {
                console.log(`Updated after ${i + 1} attempts`);
                return true;
            }
        } catch (error) {
            console.log(`Attempt ${i + 1} failed:`, error.message);
        }
        
        if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            delayMs = Math.min(delayMs * 1.5, 3000);
        }
    }
    return false;
}

// UI Helpers
function showLoading(text = 'Processing...') {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
}

// Modal Functions
window.showDepositModal = function() {
    document.getElementById('depositModal').classList.add('active');
}

window.closeDepositModal = function() {
    document.getElementById('depositModal').classList.remove('active');
}

window.setDepositAmount = function(amount) {
    document.getElementById('depositAmount').value = amount;
}

window.closeReviewModal = function() {
    document.getElementById('reviewModal').classList.remove('active');
}

window.closeNetworkModal = function() {
    document.getElementById('networkModal').classList.remove('active');
}

function updateContractAddress() {
    document.getElementById('footerContractAddress').textContent = CONTRACT_ADDRESS;
}

// Debug
window.debugApp = {
    client,
    currentAccount,
    currentPage,
    allProjects,
    navigateTo,
    loadDashboard
};
