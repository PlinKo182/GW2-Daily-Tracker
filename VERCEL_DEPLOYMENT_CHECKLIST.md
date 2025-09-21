# ✅ Vercel Deployment Checklist for Tyria Tracker

## Pre-Deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster (free tier is sufficient)
- [ ] Create database user with read/write permissions
- [ ] Whitelist IP addresses (0.0.0.0/0 for development)
- [ ] Get connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 2. GitHub Repository
- [ ] Push all code to GitHub repository
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Verify `vercel.json` is in root directory

## Vercel Deployment Steps

### 1. Connect Repository
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project" 
- [ ] Import your GitHub repository
- [ ] Select "Tyria Tracker" project

### 2. Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

**Production Environment:**
- [ ] `MONGO_URL` = `mongodb+srv://username:password@cluster.mongodb.net/`
- [ ] `DB_NAME` = `tyria_tracker`
- [ ] `REACT_APP_BACKEND_URL` = `https://your-project-name.vercel.app`

**Preview Environment:**
- [ ] Same variables as production (or separate staging database)

### 3. Build Settings
Vercel should auto-detect:
- [ ] Framework Preset: `Create React App`
- [ ] Build Command: `yarn build` (frontend)
- [ ] Output Directory: `frontend/build`
- [ ] Install Command: `yarn install`

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Test the deployed application

## Post-Deployment Verification

### 1. Frontend Testing
- [ ] Dashboard loads correctly
- [ ] Progress bars work
- [ ] Task checkboxes function
- [ ] Event countdowns display
- [ ] Waypoint copying works
- [ ] Responsive design on mobile

### 2. Backend Testing
- [ ] API health check: `https://your-app.vercel.app/api/`
- [ ] Progress endpoint: `https://your-app.vercel.app/api/progress/test-user`
- [ ] Events endpoint: `https://your-app.vercel.app/api/events/test-user`
- [ ] CORS headers allow frontend domain

### 3. Integration Testing
- [ ] Progress saves to database
- [ ] Cross-device sync works
- [ ] Offline functionality
- [ ] Daily reset functionality
- [ ] Event completion tracking

## Custom Domain (Optional)

### 1. Add Domain
- [ ] Go to Vercel Dashboard → Settings → Domains
- [ ] Add your custom domain
- [ ] Configure DNS records as instructed

### 2. Update Environment Variables
- [ ] Update `REACT_APP_BACKEND_URL` to use custom domain
- [ ] Redeploy application

## Troubleshooting

### Common Issues

**Build Failures:**
- [ ] Check build logs in Vercel dashboard
- [ ] Verify all dependencies are in package.json
- [ ] Ensure environment variables are set

**API Connection Issues:**
- [ ] Verify CORS configuration allows frontend domain
- [ ] Check MongoDB connection string format
- [ ] Confirm database user permissions

**Environment Variable Issues:**
- [ ] Variables must be set in Vercel dashboard
- [ ] Frontend variables must start with `REACT_APP_`
- [ ] Redeploy after changing variables

### Debug Steps
1. Check Vercel function logs
2. Test API endpoints directly
3. Verify MongoDB Atlas connection
4. Check browser developer console

## Performance Optimization

### 1. Frontend
- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images and assets

### 2. Backend
- [ ] Monitor function execution time
- [ ] Optimize database queries
- [ ] Cache static responses

## Security Checklist

- [ ] MongoDB user has minimal required permissions
- [ ] CORS origins are restricted to your domains
- [ ] Environment variables contain no hardcoded secrets
- [ ] HTTPS is enforced (automatic with Vercel)

## Success Criteria

✅ **Deployment is successful when:**
- Frontend loads without errors
- Backend API responds correctly
- Database operations work
- Progress tracking persists across sessions
- Event countdowns display correctly
- Mobile responsive design works
- Daily reset functionality operates

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

**🎉 Once all items are checked, your Tyria Tracker is live and ready for Guild Wars 2 players!**