// ReputedMochi Web3 App
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

// Contract Address - Update this with your deployed contract address
const CONTRACT_ADDRESS = '0xE059aC730dDc0B48Fc1649272CdbcC70BDd04193';

// GenLayer Network Configuration
const GENLAYER_NETWORK = {
    chainId: '0xf22f', // 61999 in hex
    chainName: 'GenLayer Studio',
    nativeCurrency: {
        name: 'GEN',
        symbol: 'GEN',
        decimals: 18
    },
    rpcUrls: ['https://studio.genlayer.com/api'],
    blockExplorerUrls: []
};

// Global State
let client = null;
let currentAccount = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkWalletConnection();
});

// Setup Event Listeners
function setupEventListeners() {
    // Wallet buttons
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    document.getElementById('disconnectBtn').addEventListener('click', disconnectWallet);
    document.getElementById('addNetworkBtn').addEventListener('click', () => {
        document.getElementById('networkModal').classList.add('active');
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Account changed
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }
}

// Wallet Connection
async function connectWallet() {
    try {
        if (!window.ethereum) {
            showToast('Please install MetaMask to use this dApp', 'error');
            return;
        }

        showLoading('Connecting wallet...');

        // Request accounts
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        currentAccount = accounts[0];

        // Check if on GenLayer network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== GENLAYER_NETWORK.chainId) {
            await switchToGenLayer();
        }

        // Initialize client
        client = createClient({
            chain: studionet,
            account: currentAccount
        });

        // Update UI
        updateWalletUI();
        await loadDashboard();
        await loadAllProjects();

        showToast('Wallet connected successfully!', 'success');
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
        // Chain not added, try to add it
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
        showToast(`Failed to add network: ${error.message}`, 'error');
    }
}

function disconnectWallet() {
    currentAccount = null;
    client = null;
    updateWalletUI();
    document.getElementById('dashboardSection').style.display = 'none';
    showToast('Wallet disconnected', 'success');
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        disconnectWallet();
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        updateWalletUI();
        loadDashboard();
    }
}

function updateWalletUI() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletInfo = document.getElementById('walletInfo');
    const dashboardSection = document.getElementById('dashboardSection');

    if (currentAccount) {
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'flex';
        dashboardSection.style.display = 'block';
        document.getElementById('walletAddress').textContent = 
            `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
    } else {
        connectBtn.style.display = 'block';
        walletInfo.style.display = 'none';
        dashboardSection.style.display = 'none';
    }
}

async function checkWalletConnection() {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            currentAccount = accounts[0];
            client = createClient({
                chain: studionet,
                account: currentAccount
            });
            updateWalletUI();
            await loadDashboard();
            await loadAllProjects();
        }
    }
}

// Dashboard Functions
async function loadDashboard() {
    if (!client || !currentAccount) return;

    try {
        const dashboard = await callContractRead('get_my_dashboard', [currentAccount]);
        
        console.log('Dashboard loaded:', dashboard);
        
        // Convert Map to object or use .get() method
        const getVal = (key) => {
            if (dashboard instanceof Map) {
                return Number(dashboard.get(key) || 0);
            }
            return dashboard[key] || 0;
        };
        
        // Update balance card
        document.getElementById('balance').textContent = getVal('balance');
        document.getElementById('reviewsPossible').textContent = getVal('reviews_possible');
        
        // Update review stats
        document.getElementById('totalReviews').textContent = getVal('total_reviews');
        document.getElementById('approvedReviews').textContent = getVal('approved_reviews');
        document.getElementById('flaggedReviews').textContent = getVal('flagged_reviews');
        
        // Update earnings
        document.getElementById('totalDeposited').textContent = getVal('total_deposited');
        document.getElementById('totalRefunded').textContent = getVal('total_refunded');
        document.getElementById('totalSlashed').textContent = getVal('total_slashed');
        document.getElementById('netEarnings').textContent = getVal('net_earnings');
        
        // Update community stats
        document.getElementById('helpfulVotes').textContent = getVal('helpful_votes_received');
        document.getElementById('stakePerReview').textContent = getVal('stake_per_review') || 100;
        
        // Update stake amounts in forms
        document.getElementById('stakeRequired').textContent = getVal('stake_per_review') || 100;
        document.getElementById('stakeRequiredBtn').textContent = getVal('stake_per_review') || 100;

    } catch (error) {
        console.error('Dashboard load error:', error);
        showToast('Failed to load dashboard', 'error');
    }
}

// Deposit Functions
window.showDepositModal = function() {
    document.getElementById('depositModal').classList.add('active');
}

window.closeDepositModal = function() {
    document.getElementById('depositModal').classList.remove('active');
}

window.setDepositAmount = function(amount) {
    document.getElementById('depositAmount').value = amount;
}

window.depositTokens = async function(event) {
    event.preventDefault();
    
    if (!client || !currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }

    const amount = parseInt(document.getElementById('depositAmount').value);
    
    console.log('Depositing:', amount, 'for account:', currentAccount);
    
    try {
        showLoading('Depositing tokens...');
        
        const result = await callContractWrite('deposit', [currentAccount, amount]);
        
        console.log('Deposit result:', result);
        
        closeDepositModal();
        document.getElementById('depositForm').reset();
        
        // Wait for state to update
        showLoading('Deposit confirmed! Waiting for blockchain update...');
        
        const oldBalance = document.getElementById('balance').textContent;
        
        await waitForStateUpdate(async () => {
            await loadDashboard();
            const newBalance = document.getElementById('balance').textContent;
            return newBalance !== oldBalance;
        });
        
        hideLoading();
        showToast('Deposit successful! Balance updated ✅', 'success');
        
    } catch (error) {
        console.error('Deposit error:', error);
        showToast(`Deposit failed: ${error.message}`, 'error');
        hideLoading();
    }
}

// Project Functions
window.loadAllProjects = async function() {
    if (!client) {
        document.getElementById('projectsList').innerHTML = 
            '<p class="empty-state">Please connect wallet to view projects</p>';
        return;
    }

    try {
        document.getElementById('projectsList').innerHTML = 
            '<p class="empty-state">Loading projects...</p>';
        
        const projects = await callContractRead('get_all_projects', []);
        
        console.log('Projects loaded:', projects); // Debug log
        
        if (!projects || projects.length === 0) {
            document.getElementById('projectsList').innerHTML = 
                '<p class="empty-state">No projects registered yet. Be the first to register one!</p>';
            // Clear the dropdown too
            document.getElementById('projectNamesList').innerHTML = '';
            return;
        }

        let html = '';
        let dropdownOptions = '';
        
        for (const project of projects) {
            console.log('Project:', project); // Debug each project
            
            // Helper to get value from Map or object
            const getVal = (key) => {
                if (project instanceof Map) {
                    return project.get(key);
                }
                return project[key];
            };
            
            // Handle both possible return formats
            const name = getVal('name') || 'Unknown';
            const category = getVal('category') || 'Unknown';
            const reputation_score = Number(getVal('reputation_score') || 500);
            const average_stars = Number(getVal('average_stars') || 30);
            const reputation_level = getVal('reputation_level') || 'Average';
            const total_reviews = Number(getVal('total_reviews') || 0);
            
            const avgStars = (average_stars / 10).toFixed(1);
            const stars = '⭐'.repeat(Math.round(average_stars / 10));
            
            html += `
                <div class="project-card" onclick="viewProject('${name}')">
                    <div class="project-header">
                        <div>
                            <div class="project-name">${name}</div>
                            <span class="project-category">${category}</span>
                        </div>
                    </div>
                    <div class="project-reputation">
                        <span class="reputation-score">${reputation_score}/1000</span>
                        <span class="reputation-level">${reputation_level}</span>
                    </div>
                    <div class="project-stats">
                        <span>${stars} ${avgStars}/5</span>
                        <span>📝 ${total_reviews} reviews</span>
                    </div>
                </div>
            `;
            
            // Add to dropdown
            dropdownOptions += `<option value="${name}">${name} (${category})</option>`;
        }
        
        document.getElementById('projectsList').innerHTML = html;
        
        // Update the datalist for project name input
        document.getElementById('projectNamesList').innerHTML = dropdownOptions;
        
    } catch (error) {
        console.error('Load projects error:', error);
        document.getElementById('projectsList').innerHTML = 
            '<p class="empty-state">Failed to load projects</p>';
    }
}

window.viewProject = async function(projectName) {
    // Switch to submit review tab and prefill project name (exact case)
    switchTab('submit');
    document.getElementById('reviewProjectName').value = projectName;
    // Focus on the rating to make it easier to continue
    setTimeout(() => {
        document.querySelector('input[name="rating"]')?.focus();
    }, 100);
}

// Register Project
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
        
        const result = await callContractWrite('register_project', [
            currentAccount,
            name,
            category,
            description,
            website
        ]);
        
        document.getElementById('registerForm').reset();
        
        // Wait for state to update
        showLoading('Project registered! Waiting for blockchain update...');
        
        await waitForStateUpdate(async () => {
            await loadAllProjects();
            const projectsList = document.getElementById('projectsList').innerHTML;
            return projectsList.includes(name);
        });
        
        hideLoading();
        showToast('Project registered successfully! ✅', 'success');
        switchTab('browse');
        
    } catch (error) {
        console.error('Register error:', error);
        showToast(`Registration failed: ${error.message}`, 'error');
        hideLoading();
    }
}

// Submit Review
window.submitReview = async function(event) {
    event.preventDefault();
    
    if (!client || !currentAccount) {
        showToast('Please connect wallet first', 'error');
        return;
    }

    const projectName = document.getElementById('reviewProjectName').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked');
    
    if (!rating) {
        showToast('Please select a star rating', 'error');
        return;
    }
    
    const text = document.getElementById('reviewText').value;

    console.log('Submitting review:', {projectName, rating: rating.value, text});

    try {
        showLoading('Checking project...');
        
        // Check if project exists first
        const projectExists = await callContractRead('project_exists', [projectName]);
        console.log('Project exists check:', projectName, '=', projectExists);
        
        if (!projectExists) {
            hideLoading();
            showToast(`Project "${projectName}" not found. Please check the spelling (case-sensitive).`, 'error');
            return;
        }
        
        showLoading('Submitting review...');
        
        const result = await callContractWrite('submit_review', [
            currentAccount,
            projectName,
            parseInt(rating.value),
            text
        ]);
        
        console.log('Review submit result:', result);
        
        document.getElementById('reviewForm').reset();
        
        // Wait for state to update
        showLoading('Review submitted! Waiting for blockchain update...');
        
        const oldReviewCount = document.getElementById('totalReviews').textContent;
        
        await waitForStateUpdate(async () => {
            await loadDashboard();
            await loadMyReviews();
            const newReviewCount = document.getElementById('totalReviews').textContent;
            return newReviewCount !== oldReviewCount;
        });
        
        hideLoading();
        showToast('Review submitted successfully! Data updated ✅', 'success');
        switchTab('myReviews');
        
    } catch (error) {
        console.error('Submit review error:', error);
        showToast(`Review submission failed: ${error.message}`, 'error');
        hideLoading();
    }
}

// My Reviews
window.loadMyReviews = async function() {
    if (!client || !currentAccount) {
        document.getElementById('myReviewsList').innerHTML = 
            '<p class="empty-state">Please connect wallet to view your reviews</p>';
        return;
    }

    try {
        document.getElementById('myReviewsList').innerHTML = 
            '<p class="empty-state">Loading your reviews...</p>';
        
        const reviews = await callContractRead('get_my_reviews', [currentAccount]);
        
        console.log('My reviews loaded:', reviews);
        
        if (!reviews || reviews.length === 0) {
            document.getElementById('myReviewsList').innerHTML = 
                '<p class="empty-state">You haven\'t submitted any reviews yet</p>';
            return;
        }

        let html = '';
        for (const review of reviews) {
            // Helper to get value from Map or object
            const getVal = (key) => {
                if (review instanceof Map) {
                    return review.get(key);
                }
                return review[key];
            };
            
            const stars = '⭐'.repeat(Number(getVal('stars')));
            const statusClass = String(getVal('status')).toLowerCase();
            
            html += `
                <div class="review-card">
                    <div class="review-header">
                        <div>
                            <div class="review-project">${getVal('project')}</div>
                            <div class="review-stars">${stars}</div>
                        </div>
                        <span class="review-status ${statusClass}">${String(getVal('status')).toUpperCase()}</span>
                    </div>
                    <div class="review-text">${getVal('text')}</div>
                    <div class="review-feedback">
                        📊 Quality Score: ${getVal('quality_score')}/100<br>
                        ${getVal('feedback')}
                    </div>
                    <div class="review-meta">
                        <span>👍 ${getVal('helpful_votes')} helpful</span>
                        <span>💰 Stake: ${getVal('stake')} GEN</span>
                        <span>🕒 ${new Date(getVal('timestamp')).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('myReviewsList').innerHTML = html;
        
    } catch (error) {
        console.error('Load reviews error:', error);
        document.getElementById('myReviewsList').innerHTML = 
            '<p class="empty-state">Failed to load your reviews</p>';
    }
}

// Transactions
window.loadTransactions = async function() {
    if (!client || !currentAccount) {
        document.getElementById('transactionsList').innerHTML = 
            '<p class="empty-state">Please connect wallet to view transactions</p>';
        return;
    }

    try {
        document.getElementById('transactionsList').innerHTML = 
            '<p class="empty-state">Loading transactions...</p>';
        
        const transactions = await callContractRead('get_my_transactions', [currentAccount, 50]);
        
        if (!transactions || transactions.length === 0) {
            document.getElementById('transactionsList').innerHTML = 
                '<p class="empty-state">No transactions yet</p>';
            return;
        }

        let html = '';
        for (const tx of transactions) {
            // Helper to get value from Map or object
            const getVal = (key) => {
                if (tx instanceof Map) {
                    return tx.get(key);
                }
                return tx[key];
            };
            
            const txType = String(getVal('type'));
            const isPositive = txType === 'deposit' || txType === 'refund';
            const amountClass = isPositive ? 'positive' : 'negative';
            const sign = isPositive ? '+' : '-';
            
            html += `
                <div class="transaction-card">
                    <div class="transaction-info">
                        <div class="transaction-type">${txType.toUpperCase()}</div>
                        <div class="transaction-description">${getVal('description')}</div>
                        <div class="transaction-time">${new Date(getVal('timestamp')).toLocaleString()}</div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${sign}${Number(getVal('amount'))} GEN
                    </div>
                </div>
            `;
        }
        
        document.getElementById('transactionsList').innerHTML = html;
        
    } catch (error) {
        console.error('Load transactions error:', error);
        document.getElementById('transactionsList').innerHTML = 
            '<p class="empty-state">Failed to load transactions</p>';
    }
}

// Tab Navigation
function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Load data for specific tabs
    if (tabName === 'myReviews') {
        loadMyReviews();
    } else if (tabName === 'transactions') {
        loadTransactions();
    }
}

// Modal Functions
window.closeNetworkModal = function() {
    document.getElementById('networkModal').classList.remove('active');
}

// UI Helper Functions
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
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Contract Interaction Helpers
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

// Helper to wait for blockchain state to update after a write
async function waitForStateUpdate(checkFunction, maxAttempts = 10, delayMs = 500) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const result = await checkFunction();
            if (result) {
                console.log(`State updated after ${i + 1} attempts`);
                return true;
            }
        } catch (error) {
            console.log(`Attempt ${i + 1} failed:`, error.message);
        }
        
        if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            // Exponential backoff
            delayMs = Math.min(delayMs * 1.5, 3000);
        }
    }
    console.log('Max attempts reached, proceeding anyway');
    return false;
}

// Export for debugging
window.debugApp = {
    client,
    currentAccount,
    loadDashboard,
    loadAllProjects,
    callContractRead,
    callContractWrite
};
