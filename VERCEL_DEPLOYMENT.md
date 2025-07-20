# 🚀 Vercel Deployment Guide for Concordia DApp

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **BNB Greenfield Account**: Set up Greenfield storage
4. **Smart Contract Deployed**: Deploy to opBNB Testnet

## Step 1: Prepare Environment Variables

### Required Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address

# BNB Greenfield Configuration
GREENFIELD_ACCESS_KEY=your_greenfield_access_key
GREENFIELD_SECRET_KEY=your_greenfield_secret_key
GREENFIELD_BUCKET_NAME=concordia-data
GREENFIELD_ENDPOINT=https://gnfd-testnet-sp1.bnbchain.org

# Blockchain Network
NEXT_PUBLIC_CHAIN_ID=5611
NEXT_PUBLIC_CHAIN_NAME=opBNB Testnet
```

### How to Get Greenfield Credentials

1. **Visit BNB Greenfield Console**: [https://greenfield.bnbchain.org/](https://greenfield.bnbchain.org/)
2. **Create Account**: Sign up and verify your account
3. **Create Bucket**: Create a bucket named `concordia-data`
4. **Generate API Keys**: Go to API Keys section and create new keys
5. **Set Permissions**: Ensure your keys have read/write permissions

## Step 2: Deploy Smart Contract

```bash
# Navigate to project directory
cd concordia-dapp-backend

# Install dependencies
npm install

# Deploy contract
npx hardhat run scripts/deploy.js --network opBNBTestnet
```

Copy the deployed contract address and add it to your environment variables.

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. **Connect Repository**: Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Import Project**: Click "New Project" and import your GitHub repository
3. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 4: Configure Environment Variables in Vercel

1. **Go to Project Settings**: In your Vercel dashboard
2. **Environment Variables**: Add all variables from `.env.local`
3. **Deploy**: Redeploy the project

### Environment Variables in Vercel Dashboard

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x...` | Deployed smart contract address |
| `GREENFIELD_ACCESS_KEY` | `your_key` | BNB Greenfield access key |
| `GREENFIELD_SECRET_KEY` | `your_secret` | BNB Greenfield secret key |
| `GREENFIELD_BUCKET_NAME` | `concordia-data` | Greenfield bucket name |
| `GREENFIELD_ENDPOINT` | `https://gnfd-testnet-sp1.bnbchain.org` | Greenfield endpoint |

## Step 5: Verify Deployment

### Check API Routes

Test your API endpoints:

```bash
# Test group storage
curl -X POST https://your-app.vercel.app/api/groups/store \
  -H "Content-Type: application/json" \
  -d '{"groupId":"test","groupData":{"name":"Test Group"}}'

# Test group retrieval
curl https://your-app.vercel.app/api/groups
```

### Check Frontend

1. **Visit your app**: `https://your-app.vercel.app`
2. **Connect Wallet**: Use MetaMask with opBNB Testnet
3. **Create Group**: Test the full flow
4. **Verify Data**: Check that data is stored in Greenfield

## Step 6: Enable Team Member Access

### Public Access Configuration

The app is configured to allow team members to access group data:

1. **Greenfield Permissions**: Bucket is set to public read
2. **API Routes**: All group data is accessible via API
3. **Frontend**: Automatically loads user's groups on wallet connection

### How Team Members Join

1. **Visit the App**: Team members visit your deployed URL
2. **Connect Wallet**: Use MetaMask with opBNB Testnet
3. **Auto-Load Groups**: Dashboard automatically shows groups they're members of
4. **Contribute**: Can contribute to existing groups

## Step 7: Monitor and Maintain

### Vercel Analytics

- **Performance**: Monitor app performance in Vercel dashboard
- **Errors**: Check function logs for any issues
- **Uptime**: Monitor deployment status

### Greenfield Monitoring

- **Storage Usage**: Monitor bucket usage in Greenfield console
- **API Calls**: Track API usage and costs
- **Data Integrity**: Verify data is being stored correctly

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Ensure all variables are set in Vercel dashboard
   - Redeploy after adding variables

2. **Greenfield Connection Issues**
   - Verify API keys are correct
   - Check bucket permissions
   - Ensure endpoint is accessible

3. **Smart Contract Issues**
   - Verify contract is deployed to correct network
   - Check contract address is correct
   - Ensure wallet is connected to opBNB Testnet

4. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Support

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **BNB Greenfield Docs**: [docs.bnbchain.org](https://docs.bnbchain.org)
- **opBNB Testnet**: [testnet.bnbchain.org](https://testnet.bnbchain.org)

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to Git
2. **API Rate Limiting**: Consider implementing rate limiting for API routes
3. **Data Validation**: Validate all input data before storing
4. **Access Control**: Implement proper access control for group operations

## Cost Optimization

1. **Greenfield Storage**: Monitor storage usage and costs
2. **Vercel Functions**: Optimize function execution time
3. **CDN Usage**: Leverage Vercel's global CDN for static assets

---

## 🎉 Deployment Complete!

Your Concordia DApp is now live on Vercel with:
- ✅ **Permanent BNB Greenfield Storage**
- ✅ **Public Access for Team Members**
- ✅ **No Data Loss on Reload**
- ✅ **Automatic Dashboard Loading**
- ✅ **Blockchain Integration**

Share your app URL with team members to start saving together! 🚀 