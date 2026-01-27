# ⚡ ReputedMochi - Quick Start Guide

Get ReputedMochi running in 5 minutes!

## 🚀 Super Quick Start

```bash
# 1. Clone and install
git clone https://github.com/iamdudeGH/reputed-mochi.git
cd reputed-mochi
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit: http://localhost:3000
```

That's it! 🎉

---

## 📝 For First-Time Users

### What You Need:
- ✅ MetaMask browser extension
- ✅ GenLayer network added to MetaMask
- ✅ Some GEN tokens (for testing)

### First Steps in the App:

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection

2. **Add GenLayer Network** (if not added)
   - Click "➕ Add GenLayer Network"
   - Approve in MetaMask

3. **Browse Projects** (No wallet needed!)
   - Click "Browse Projects" tab
   - View all registered projects
   - See ratings and reviews

4. **Deposit Tokens** (To submit reviews)
   - Go to Dashboard
   - Enter amount (e.g., 1000 GEN)
   - Click "Deposit"
   - Approve transaction

5. **Submit Your First Review**
   - Find a project in "Browse" tab
   - Rate it with stars (1-5)
   - Write detailed review (50+ characters for best score)
   - Submit and get instant quality feedback!

---

## 💰 Token Requirements

- **Deposit:** Any amount (minimum 100 GEN to review)
- **Review:** 100 GEN stake per review (refunded based on quality)
- **Register Project:** 5000 GEN stake (anti-spam protection)

---

## 🎯 Review Quality Tips

To get full refund (100 GEN):
- ✅ Write 50+ characters
- ✅ Use 10+ words
- ✅ Be specific and detailed
- ✅ Avoid spam keywords
- ✅ Don't use all caps

**Score 70+** = Full refund ✅  
**Score 40-69** = Partial refund (50 GEN) ⚠️  
**Score <40** = No refund 🚫

---

## 🏗️ For Developers

### Deploy Your Own:

```bash
# 1. Deploy contract to GenLayer Studio
# Copy contract from: contracts/reputed_mochi_clear.py
# Deploy at: https://studio.genlayer.com

# 2. Update contract address in app.js (line 5)
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';

# 3. Build for production
npm run build

# 4. Deploy to Vercel
npm install -g vercel
vercel --prod
```

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## 🎨 Project Categories

- **DeFi** - Decentralized Finance
- **NFT** - Non-Fungible Tokens
- **Gaming** - Web3 Games
- **DAO** - Decentralized Autonomous Organizations
- **Infrastructure** - Blockchain Infrastructure
- **Social** - Social Networks
- **Metaverse** - Virtual Worlds
- **Other** - Everything Else

---

## 🔑 Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search (coming soon)
- `Tab` - Navigate between tabs
- `Esc` - Close modals

---

## 🐛 Quick Troubleshooting

**Problem:** Can't connect wallet  
**Solution:** Install MetaMask and unlock it

**Problem:** Wrong network  
**Solution:** Click "Add GenLayer Network" button

**Problem:** Transaction fails  
**Solution:** Check you have enough GEN tokens

**Problem:** Reviews don't show  
**Solution:** Refresh page or check contract address

---

## 📚 Learn More

- **Full Documentation:** [README.md](README.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **GenLayer Docs:** https://docs.genlayer.com
- **Smart Contract:** [contracts/reputed_mochi_clear.py](contracts/reputed_mochi_clear.py)

---

## 💡 Pro Tips

1. **Test First:** Use GenLayer Studio to test contract methods
2. **Quality Matters:** Write detailed reviews for full refunds
3. **Build Reputation:** Approved reviews boost your profile
4. **Vote Helpful:** Help others by voting helpful reviews
5. **Create Profile:** Stand out with a custom profile

---

## 🤝 Community

- **GitHub Issues:** Report bugs or request features
- **Discussions:** Share ideas and feedback
- **Contributors:** PRs welcome!

---

**Happy Reviewing! 🍡**

Built with ❤️ on GenLayer
