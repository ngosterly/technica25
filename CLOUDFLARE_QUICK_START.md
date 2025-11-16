# Cloudflare Pages - Quick Start Guide

## What Was Created

Your Express backend has been converted to **Cloudflare Workers** (serverless functions). Here's what's new:

### New Files Created:

```
functions/
├── api/
│   ├── 1-extract-options.js      ✅ Extracts decision options
│   ├── 2-extract-categories.js   ✅ Generates comparison categories
│   ├── 3-score-options.js        ✅ AI rates each option
│   ├── 4-finalize-result.js      ✅ Calculates scores & saves to DB
│   └── health.js                 ✅ Health check endpoint
├── utils/
│   ├── api.js                    ✅ AI/LLM utility functions
│   └── db.js                     ✅ Firebase database utilities
└── package.json                  ✅ Dependencies for Workers
```

### Updated Files:
- `.gitignore` - Added Cloudflare-specific ignores

---

## How It Works

### Local Development (No Changes Required!)

You can **continue using your Express server** for local development:

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev

# Open: http://localhost:5173
```

Everything works exactly as before! ✅

---

## Deploy to Cloudflare (Production)

### 🚀 Quick Deploy (3 Steps):

#### 1. Push to GitHub
```bash
git add .
git commit -m "Add Cloudflare Workers backend"
git push origin main
```

#### 2. Connect to Cloudflare Pages
- Go to [dash.cloudflare.com](https://dash.cloudflare.com)
- Click **Pages** → **Create a project**
- Connect your GitHub repository
- Build settings:
  - **Build command**: `npm run build`
  - **Output directory**: `dist`

#### 3. Add Environment Variables
In Cloudflare dashboard, add these secrets:

```
OPENROUTER_API_KEY = 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

FIREBASE_DB_URL = https://decisionera-67322-default-rtdb.firebaseio.com/

FIREBASE_ADMIN_JSON = {paste entire JSON from decisionera-67322-firebase-adminsdk-fbsvc-0e85f9d3bf.json}
```

Click **Deploy** and you're done! 🎉

Your app will be live at: `https://[project-name].pages.dev`

---

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app.pages.dev/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "worker": "cloudflare-pages"
}
```

### 2. Full Flow Test
1. Visit `https://your-app.pages.dev/decision`
2. Enter: "Should I bike or drive to work?"
3. Verify each step works
4. Check Firebase for saved decision

---

## Endpoints

All your Express endpoints work exactly the same:

| Endpoint | Method | Function |
|----------|--------|----------|
| `/api/1-extract-options` | POST | Extract options from prompt |
| `/api/2-extract-categories` | POST | Generate categories |
| `/api/3-score-options` | POST | AI rates options |
| `/api/4-finalize-result` | POST | Calculate & save result |
| `/api/health` | GET | Health check |

**No frontend changes needed!** The API calls are identical.

---

## Key Differences: Express vs Cloudflare Workers

| Feature | Express (Local) | Cloudflare Workers |
|---------|----------------|-------------------|
| **Location** | Your computer | 300+ edge locations worldwide |
| **Scaling** | Manual | Automatic |
| **Cold starts** | N/A | None - instant |
| **Cost** | $0 (local only) | Free: 100k req/day |
| **Setup** | `npm run server` | Deploy once, always on |

---

## Common Questions

### Q: Do I need to change my React code?
**A:** No! The frontend makes the same API calls (`/api/*`). Everything works automatically.

### Q: Can I still develop locally?
**A:** Yes! Keep using `npm run server` + `npm run dev` as before.

### Q: What about the old `api/` folder?
**A:** Keep it for reference! You can delete it later once Cloudflare deployment is confirmed working.

### Q: How much does this cost?
**A:** Free tier includes:
- 100,000 requests/day
- Unlimited bandwidth
- Global CDN

### Q: Is it faster than Express?
**A:** Yes! Workers run at the edge (closer to users) with no cold starts.

---

## Troubleshooting

### "API not working after deploy"

✅ Check environment variables are set in Cloudflare dashboard
✅ Verify `functions/` folder is in your Git repository
✅ Check build logs in Cloudflare Pages dashboard

### "Firebase connection error"

✅ Ensure `FIREBASE_ADMIN_JSON` is a single line (no newlines)
✅ Verify `FIREBASE_DB_URL` is correct
✅ Check Firebase project is active

---

## File Structure

```
Your Project
├── src/              → React frontend (unchanged)
├── functions/        → NEW: Cloudflare Workers backend
├── api/              → OLD: Express backend (keep for local dev)
├── dist/             → Build output (auto-generated)
└── [config files]
```

**Strategy:**
- **Development**: Use Express (`api/` folder)
- **Production**: Use Cloudflare Workers (`functions/` folder)

---

## Next Steps

1. ✅ Test locally (already working!)
2. 🚀 Push to GitHub
3. 🔗 Connect to Cloudflare Pages
4. 🔐 Add environment variables
5. 🎉 Deploy!

Full details: See `CLOUDFLARE_DEPLOYMENT.md`

---

## Support

- **Cloudflare Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Questions?** Check logs in Cloudflare dashboard

Your app is ready to go global! 🌍
