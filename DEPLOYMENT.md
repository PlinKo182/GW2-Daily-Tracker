# Tyria Tracker - Vercel Deployment Guide (Simplified)

## Overview
This guide covers deploying the Tyria Tracker app to Vercel. **No database required** - all data is stored locally in the browser!

## Prerequisites
- Vercel account
- Git repository
- That's it! 🎉

## Quick Deploy to Vercel

### 1. Deploy to Vercel
1. Push your code to GitHub/GitLab
2. Connect your repository to Vercel
3. Framework Preset: **Create React App**
4. Set environment variable:
   - `REACT_APP_BACKEND_URL`: `https://your-app-name.vercel.app`
5. Deploy!

### 2. Deploy Command
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod
```

## Environment Variables

### Required
- `REACT_APP_BACKEND_URL`: Your Vercel app URL (e.g., https://tyria-tracker.vercel.app)

### That's it!
No database configuration needed!

## Features

✅ **Fully Functional:**
- Daily progress tracking (localStorage)
- Event countdowns and completion tracking
- Waypoint copying for Guild Wars 2
- Daily UTC reset functionality
- Offline-first design
- No registration or login required

✅ **Privacy-First:**
- All data stored locally in your browser
- No server-side user tracking
- Works completely offline
- Data never leaves your device

## Build Commands

### Frontend
```bash
cd frontend
yarn install
yarn build
```

### Backend (Simple API)
```bash
cd backend
pip install -r requirements.txt
```

## Domain Configuration

### Custom Domain (Optional)
1. Add your domain in Vercel dashboard
2. Configure DNS:
   - Type: CNAME
   - Name: www (or @)
   - Value: cname.vercel-dns.com

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] API health check responds
- [ ] Progress tracking works in browser
- [ ] Event completion saves locally
- [ ] Daily reset functionality working
- [ ] Mobile responsive design works

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify `REACT_APP_BACKEND_URL` is set correctly

2. **API Connection Issues**
   - Check if backend is deployed correctly
   - Verify CORS configuration allows frontend domain

### Debug Steps
1. Check Vercel function logs
2. Test API health endpoint: `https://your-app.vercel.app/api/`
3. Check browser developer console

## Performance Benefits

### Advantages of localStorage approach:
- ⚡ **Lightning Fast** - No database queries
- 🔒 **Privacy-First** - No data collection
- 💰 **Cost-Free** - No database costs
- 🌍 **Works Offline** - Perfect for gaming
- 🚀 **Simple Deployment** - No complex setup

### Limitations:
- Data is device-specific (not synced across devices)
- Data lost if browser storage is cleared
- No backup/restore functionality

## For Multi-Device Sync (Future)

If you later want cross-device sync, you can:
1. Add MongoDB Atlas (free tier)
2. Implement user accounts
3. Add cloud backup features

But for most users, localStorage is perfect! 🎯

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs  
3. Test API endpoints independently

## Success Criteria

✅ **Deployment is successful when:**
- Frontend loads without errors
- API health check returns success
- Progress bars work correctly
- Event countdowns display
- Task completion persists in browser
- Mobile responsive design works

---

**🎉 Much simpler without a database! Perfect for a gaming tool that just needs to work fast and reliably.**