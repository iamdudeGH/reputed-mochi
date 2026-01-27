# 🚀 ReputedMochi Deployment Guide

Complete step-by-step guide to deploy ReputedMochi to production.

## 📋 Pre-Deployment Checklist

- [ ] Node.js 16+ installed
- [ ] npm dependencies installed (`npm install`)
- [ ] MetaMask with GenLayer network configured
- [ ] GEN tokens for contract deployment
- [ ] GitHub account (for version control)
- [ ] Vercel/Netlify account (for frontend hosting)

---

## Step 1: Deploy Smart Contract (10 minutes)

### 1.1 Open GenLayer Studio
Go to: https://studio.genlayer.com

### 1.2 Create New Contract
1. Click "New Contract"
2. Name it: `ReputedMochi`
3. Select Python language

### 1.3 Deploy Contract
1. Open `contracts/reputed_mochi_clear.py`
2. Copy entire contents
3. Paste into Studio editor
4. Click "Deploy"
5. Wait for deployment confirmation
6. **Copy the contract address** (e.g., `0x1234...`)

### 1.4 Test Contract
Run these commands in Studio console:
```python
# Test deposit
deposit("YOUR_WALLET_ADDRESS", 1000)

# Check dashboard
get_my_dashboard("YOUR_WALLET_ADDRESS")

# Register test project
register_project("YOUR_WALLET_ADDRESS", "TestProject", "DeFi", "Test description", "https://test.com")

# Get all projects
get_all_projects()
```

---

## Step 2: Update Frontend (2 minutes)

### 2.1 Update Contract Address
Open `app.js` and update line 5:
```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### 2.2 Test Locally
```bash
npm run dev
```
Visit http://localhost:3000 and test:
- Connect wallet
- View dashboard
- Browse projects
- Submit review (if you have tokens)

---

## Step 3: Build for Production (2 minutes)

### 3.1 Build
```bash
npm run build
```

### 3.2 Verify Build
Check that `dist/` folder was created with:
- `index.html`
- `assets/` folder with JS and CSS

### 3.3 Test Production Build
```bash
npm run preview
```
Visit the preview URL to test production build.

---

## Step 4: Deploy Frontend (5 minutes)

### Option A: Deploy to Vercel

#### 4.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 4.2 Login to Vercel
```bash
vercel login
```

#### 4.3 Deploy
```bash
vercel --prod
```

#### 4.4 Get URL
Vercel will provide your production URL (e.g., `https://reputed-mochi.vercel.app`)

### Option B: Deploy to Netlify

#### 4.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 4.2 Login to Netlify
```bash
netlify login
```

#### 4.3 Deploy
```bash
netlify deploy --prod --dir=dist
```

#### 4.4 Get URL
Netlify will provide your production URL.

### Option C: Manual Deploy

1. Run `npm run build`
2. Upload `dist/` folder contents to your web host
3. Ensure `index.html` is the entry point

---

## Step 5: Post-Deployment Testing (10 minutes)

### 5.1 Test Wallet Connection
- [ ] Click "Connect Wallet"
- [ ] Approve MetaMask connection
- [ ] Verify wallet address shows

### 5.2 Test Network Addition
- [ ] Click "Add GenLayer Network"
- [ ] Approve network addition in MetaMask
- [ ] Verify switch to GenLayer network

### 5.3 Test Deposit
- [ ] Go to Dashboard
- [ ] Enter amount (e.g., 1000)
- [ ] Click "Deposit"
- [ ] Approve transaction
- [ ] Verify balance updates

### 5.4 Test Project Registration
- [ ] Go to "Register Project" tab
- [ ] Fill in project details
- [ ] Click "Register" (requires 5000 GEN)
- [ ] Verify success message
- [ ] Check project appears in "Browse" tab

### 5.5 Test Review Submission
- [ ] Go to "Browse Projects" tab
- [ ] Click on a project
- [ ] Select star rating
- [ ] Write review (50+ characters recommended)
- [ ] Click "Submit Review"
- [ ] Verify quality feedback
- [ ] Check "My Reviews" tab

### 5.6 Test Public Access
- [ ] Open in incognito/private window
- [ ] Verify "Browse Projects" works without wallet
- [ ] Verify reviews are visible
- [ ] Verify project details load

---

## Step 6: Update Documentation (2 minutes)

### 6.1 Update README
In `README.md`, update:
- Contract address
- Live demo URL
- Any deployment-specific info

### 6.2 Create GitHub Release
```bash
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

---

## 🔐 Security Checklist

After deployment, verify:
- [ ] Contract address is correct
- [ ] No private keys in code
- [ ] .gitignore excludes sensitive files
- [ ] HTTPS is enabled on frontend
- [ ] CSP headers are configured (if applicable)

---

## 📊 Monitoring

### Track These Metrics:
- Total projects registered
- Total reviews submitted
- Average review quality score
- User registration rate
- Transaction success rate

### Tools:
- GenLayer Studio for contract calls
- Google Analytics for frontend (optional)
- Browser console for errors

---

## 🐛 Common Deployment Issues

### Issue: Contract deployment fails
**Solution:** Ensure you have sufficient GEN tokens and correct Python syntax

### Issue: Frontend can't connect to contract
**Solution:** Verify contract address in `app.js` is correct

### Issue: MetaMask shows wrong network
**Solution:** Manually add GenLayer network with correct Chain ID (61999)

### Issue: Build fails
**Solution:** Run `npm install` and verify `vite.config.js` is present

### Issue: Transactions fail
**Solution:** Check user has sufficient balance and is on correct network

---

## 🔄 Update Process

To update the live application:

1. **Update Contract:**
   - Deploy new contract to GenLayer Studio
   - Update address in `app.js`
   - Test locally
   - Redeploy frontend

2. **Update Frontend Only:**
   - Make changes
   - Test with `npm run dev`
   - Build with `npm run build`
   - Deploy with `vercel --prod` or `netlify deploy --prod`

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify contract address is correct
3. Test contract methods in GenLayer Studio
4. Review MetaMask network settings
5. Check this guide's troubleshooting section

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Contract is deployed and accessible
- ✅ Frontend loads without errors
- ✅ Wallet connection works
- ✅ Users can deposit tokens
- ✅ Users can register projects (with 5000 GEN)
- ✅ Users can submit reviews
- ✅ Quality scoring returns feedback
- ✅ Dashboard shows correct data
- ✅ Public browsing works without wallet

---

**🎉 Congratulations! ReputedMochi is now live!**

Share your deployment URL and start building your Web3 reputation ecosystem!
