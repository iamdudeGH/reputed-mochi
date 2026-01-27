# 🍡 ReputedMochi - Decentralized Reputation System for Web3

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GenLayer](https://img.shields.io/badge/Blockchain-GenLayer-purple)](https://genlayer.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green)](https://github.com/iamdudeGH/reputed-mochi)

A decentralized Web3 project review and reputation system built on GenLayer's Intelligent Contract Network.

## ✨ Features

- 🔐 **MetaMask Integration** - Secure wallet connection
- 💰 **Token Staking** - 100 GEN per review with quality-based refunds
- ⭐ **Star Ratings** - 1-5 star project reviews
- 🤖 **Quality Scoring** - Automated review quality analysis
- 📊 **Reputation System** - Projects earn 0-1000 reputation scores
- 👤 **User Profiles** - Customizable profiles with social links
- 🔍 **Advanced Search** - Search, filter, and sort projects
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌐 **Public Browsing** - View projects without wallet connection

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MetaMask browser extension
- GenLayer Studio network added to MetaMask

### Installation

```bash
# Clone the repository
git clone https://github.com/iamdudeGH/reputed-mochi.git
cd reputed-mochi

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## 📋 How It Works

### For Reviewers:

1. **Connect Wallet** - Connect MetaMask to GenLayer network
2. **Deposit Tokens** - Add GEN tokens to your balance
3. **Browse Projects** - Explore Web3 projects by category
4. **Submit Reviews** - Write detailed reviews with star ratings
5. **Earn Refunds** - Get stake refunds based on review quality

### For Project Owners:

1. **Register Project** - Pay 5000 GEN stake to register (anti-spam)
2. **Add Details** - Provide name, category, description, website
3. **Receive Reviews** - Users can review your project
4. **Build Reputation** - Earn 0-1000 reputation score

### Review Quality System:

- **Approved (70-100 score)** - ✅ Full refund (100 GEN)
- **Flagged (40-69 score)** - ⚠️ Partial refund (50 GEN)
- **Spam (<40 score)** - 🚫 No refund (0 GEN)

Quality is determined by:
- Review length and detail
- Word count
- Spam keyword detection
- Generic text detection
- Excessive caps

## 🔧 Configuration

### Update Contract Address

After deploying the smart contract, update the contract address in:

**`app.js`** (line 5):
```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### GenLayer Network Settings

- **Network Name:** GenLayer Studio
- **RPC URL:** https://studio.genlayer.com/api
- **Chain ID:** 61999 (0xf22f)
- **Currency:** GEN

The app will automatically prompt users to add the network.

## 📁 Project Structure

```
reputed-mochi/
├── contracts/
│   └── reputed_mochi_clear.py    # Smart contract
├── lib/
│   ├── contracts/
│   │   └── ReputedMochi.js       # Contract interface
│   └── genlayer/
│       └── client.js             # GenLayer client
├── index.html                     # Main HTML
├── app.js                        # Web3 application logic
├── style.css                     # Styling
├── package.json                  # Dependencies
├── vite.config.js                # Build config
└── README.md                     # Documentation
```

## 🎨 Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Build Tool:** Vite
- **Blockchain:** GenLayer Intelligent Contract Network
- **Wallet:** MetaMask (Web3)
- **Smart Contract:** Python (GenLayer)

## 📝 Smart Contract Methods

### Write Methods:
- `deposit(user, amount)` - Deposit tokens
- `register_project(...)` - Register new project
- `submit_review(...)` - Submit review
- `vote_helpful(voter, review_id)` - Vote review as helpful
- `create_profile(...)` - Create user profile
- `update_profile(...)` - Update user profile

### Read Methods:
- `get_my_dashboard(user)` - Get user dashboard
- `get_my_reviews(user)` - Get user's reviews
- `get_my_transactions(user, limit)` - Get transaction history
- `get_all_projects()` - Get all projects
- `get_project(name)` - Get project details
- `get_reviews(name, limit)` - Get project reviews
- `get_profile(address)` - Get user profile
- `get_stats()` - Get platform statistics

## 🔐 Security Features

- ✅ Input validation on all methods
- ✅ Balance checks before operations
- ✅ 5000 GEN registration stake (anti-spam)
- ✅ Quality-based stake refunds
- ✅ Deterministic quality scoring (no AI randomness)
- ✅ Proper error handling

## 🚢 Deployment

### Deploy Smart Contract:

1. Go to https://studio.genlayer.com
2. Create new contract
3. Copy contents of `contracts/reputed_mochi_clear.py`
4. Deploy and save contract address
5. Update address in `app.js`

### Deploy Frontend:

#### Vercel:
```bash
npm run build
vercel --prod
```

#### Netlify:
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🐛 Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed and unlocked
- Make sure GenLayer network is added
- Refresh the page

### Transaction Fails
- Check you have sufficient GEN balance
- Verify you're on GenLayer network (Chain ID: 61999)
- Try increasing gas limit

### Reviews Don't Load
- Verify contract address is correct
- Check browser console for errors
- Ensure network connection is stable

## 📖 Documentation

- [Smart Contract Specification](contracts/reputed_mochi_clear.py)
- [GenLayer Documentation](https://docs.genlayer.com)
- [MetaMask Guide](https://metamask.io/faqs/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built on [GenLayer](https://genlayer.com) - Intelligent Contract Network
- Inspired by the need for transparent Web3 project reviews
- Community-driven reputation system

## 📧 Contact

- **Developer:** iamdudeGH
- **GitHub:** [@iamdudeGH](https://github.com/iamdudeGH)
- **Project Link:** [https://github.com/iamdudeGH/reputed-mochi](https://github.com/iamdudeGH/reputed-mochi)

---

**⭐ Star this repo if you find it useful!**

Built with ❤️ on GenLayer
