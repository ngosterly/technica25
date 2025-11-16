# Cloudflare Pages Deployment Guide

## Overview

Your Decisionera app is now configured to run entirely on Cloudflare infrastructure:
- **Frontend**: Cloudflare Pages (React + Vite)
- **Backend**: Cloudflare Pages Functions (serverless Workers)
- **Database**: Firebase Realtime Database

## Project Structure

```
technica25/
├── src/                          # React frontend
├── functions/                    # Cloudflare Workers (backend)
│   ├── api/
│   │   ├── 1-extract-options.js
│   │   ├── 2-extract-categories.js
│   │   ├── 3-score-options.js
│   │   ├── 4-finalize-result.js
│   │   └── health.js
│   ├── utils/
│   │   ├── api.js              # AI utility functions
│   │   └── db.js               # Firebase utilities
│   └── package.json            # Functions dependencies
├── api/                          # Old Express backend (keep for reference)
└── dist/                         # Build output (created by Vite)
```

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI** (optional for local testing):
   ```bash
   npm install -g wrangler
   ```
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Prepare Environment Variables

You'll need these secrets configured in Cloudflare:

### Required Variables:
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `FIREBASE_ADMIN_JSON`: Firebase service account JSON (as string)
- `FIREBASE_DB_URL`: Your Firebase Realtime Database URL

### Get Firebase Service Account JSON:

```bash
# Read the file and copy the entire JSON
cat decisionera-67322-firebase-adminsdk-fbsvc-0e85f9d3bf.json
```

Copy the entire JSON content (it should be one line when you paste it).

## Step 2: Deploy to Cloudflare Pages

### A. Via Cloudflare Dashboard (Recommended)

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** in the sidebar

2. **Create a New Project**
   - Click **"Create a project"**
   - Select **"Connect to Git"**
   - Choose **GitHub** and authorize Cloudflare
   - Select your repository: `technica25`

3. **Configure Build Settings**
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave default)

4. **Set Environment Variables**
   - Click **"Environment variables"** section
   - Add these variables (for **Production** environment):

   | Variable Name | Value |
   |--------------|-------|
   | `OPENROUTER_API_KEY` | `sk-or-v1-a5edab...` |
   | `FIREBASE_DB_URL` | `https://decisionera-67322-default-rtdb.firebaseio.com/` |
   | `FIREBASE_ADMIN_JSON` | `{"type":"service_account",...}` |

   **Important**: Paste the entire Firebase JSON as a single line string!

5. **Deploy**
   - Click **"Save and Deploy"**
   - Wait 2-3 minutes for build and deployment
   - Your app will be live at: `https://technica25-xyz.pages.dev`

### B. Via Wrangler CLI (Alternative)

```bash
# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist --project-name=decisionera

# Set secrets (one at a time)
wrangler pages secret put OPENROUTER_API_KEY --project-name=decisionera
# Paste your API key when prompted

wrangler pages secret put FIREBASE_DB_URL --project-name=decisionera
# Paste: https://decisionera-67322-default-rtdb.firebaseio.com/

wrangler pages secret put FIREBASE_ADMIN_JSON --project-name=decisionera
# Paste the entire Firebase JSON (single line)
```

## Step 3: Verify Deployment

1. **Test Health Check**
   ```bash
   curl https://your-app.pages.dev/api/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-16T...",
     "worker": "cloudflare-pages"
   }
   ```

2. **Test Frontend**
   - Navigate to `https://your-app.pages.dev/decision`
   - Enter a decision prompt
   - Verify the complete flow works

3. **Check Firebase Database**
   - Open Firebase Console
   - Go to Realtime Database
   - Look for new entries under `users/`

## Step 4: Custom Domain (Optional)

1. In Cloudflare Pages dashboard:
   - Go to your project
   - Click **"Custom domains"** tab
   - Click **"Set up a custom domain"**
   - Enter your domain (e.g., `app.decisionera.com`)
   - Follow DNS setup instructions

## Local Development with Cloudflare Workers

### Option 1: Keep Using Express Server (Easiest)

```bash
# Terminal 1: Run Express backend
npm run server

# Terminal 2: Run Vite frontend
npm run dev
```

This continues to work as before - no changes needed!

### Option 2: Test Cloudflare Workers Locally

```bash
# Install dependencies for functions
cd functions
npm install
cd ..

# Build frontend
npm run build

# Run with Wrangler
wrangler pages dev dist --local

# Test at: http://localhost:8788
```

**Note**: You'll need a `.dev.vars` file for local secrets:

```bash
# Create .dev.vars in project root
cat > .dev.vars << EOF
OPENROUTER_API_KEY=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
FIREBASE_DB_URL=https://decisionera-67322-default-rtdb.firebaseio.com/
FIREBASE_ADMIN_JSON={"type":"service_account",...paste full JSON...}
EOF
```

## Troubleshooting

### Issue: "OPENROUTER_API_KEY not configured"

**Solution**: Verify environment variables are set in Cloudflare dashboard:
1. Go to your Pages project → Settings → Environment variables
2. Make sure variables are set for **Production** (and Preview if needed)
3. Redeploy: Settings → Deployments → Retry deployment

### Issue: "Failed to parse FIREBASE_ADMIN_JSON"

**Solution**: Ensure the Firebase JSON is properly formatted:
1. It should be a single line (no newlines)
2. All quotes should be properly escaped if needed
3. Copy directly from the `.json` file

### Issue: "Firebase initialization failed"

**Solution**:
1. Verify `FIREBASE_DB_URL` is correct
2. Check Firebase service account has proper permissions
3. Ensure the Firebase project is active

### Issue: API endpoints return 404

**Solution**:
1. Check `functions/` directory is in your repository
2. Verify file names match exactly (case-sensitive)
3. Check Cloudflare Pages build logs for errors

### Issue: CORS errors

**Solution**: Cloudflare Pages handles CORS automatically, but if needed:
- Add CORS headers in each Worker function
- Or use a `functions/_middleware.js` file

## Performance & Limits

### Cloudflare Workers Limits (Free Tier):
- **100,000 requests/day**
- **10ms CPU time per request** (your app uses ~5-8ms per LLM call)
- **No cold starts** - instant response

### Firebase Limits (Free Tier):
- **1GB stored data**
- **10GB/month downloads**
- **100 simultaneous connections**

### Upgrade Paths:
- **Cloudflare Workers Paid**: $5/month for 10M requests
- **Firebase Blaze Plan**: Pay-as-you-go

## Monitoring

### View Logs:
1. Cloudflare Dashboard → Pages → Your Project
2. Click **"Deployments"** → Select latest
3. Click **"View logs"** → **"Functions"** tab

### Analytics:
- Real-time analytics available in Cloudflare Dashboard
- Track: Requests, errors, response times

## CI/CD (Automatic Deployments)

Once connected to GitHub, Cloudflare automatically:
- **Deploys production** on push to `main` branch
- **Creates preview deployments** for pull requests
- **Runs builds** in parallel

### Branch Deployments:
- `main` → `https://decisionera.pages.dev`
- `feature-branch` → `https://abc123.decisionera.pages.dev`

## Differences from Express Backend

| Feature | Express (localhost) | Cloudflare Workers |
|---------|-------------------|-------------------|
| Cold starts | N/A (always running) | None (edge compute) |
| Scaling | Manual | Automatic & global |
| Cost | Hosting fees | Free tier: 100k req/day |
| Location | Single server | 300+ edge locations |
| Node.js APIs | Full access | Limited (Web APIs only) |

## Best Practices

1. **Never commit secrets**: Use environment variables
2. **Test locally first**: Use Express server for development
3. **Monitor quota**: Check Cloudflare dashboard regularly
4. **Cache responses**: Consider caching LLM responses for common prompts
5. **Rate limiting**: Add rate limiting for production use

## Support & Resources

- **Cloudflare Pages Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Workers Functions Guide**: [developers.cloudflare.com/pages/functions](https://developers.cloudflare.com/pages/functions)
- **Firebase Admin SDK**: [firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)
- **OpenRouter API**: [openrouter.ai/docs](https://openrouter.ai/docs)

## Summary

Your app is now fully serverless and globally distributed! 🚀

**Frontend + Backend on Cloudflare** = Fast, scalable, and cost-effective.

**Next Steps:**
1. Push code to GitHub
2. Connect repository to Cloudflare Pages
3. Configure environment variables
4. Deploy and test!

Your app will be live at `https://[project-name].pages.dev` in minutes.
