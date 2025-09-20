# Tyria Tracker - Vercel Deployment Guide

## Overview
This guide covers deploying the Tyria Tracker app to Vercel with both frontend and backend.

## Prerequisites
- Vercel account
- MongoDB Atlas account (for database)
- Git repository

## Option 1: Full-Stack Deployment on Vercel

### 1. Setup MongoDB Atlas
1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get your connection string
4. Create a database named `tyria_tracker`

### 2. Deploy to Vercel
1. Push your code to GitHub/GitLab
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `DB_NAME`: `tyria_tracker`
   - `REACT_APP_BACKEND_URL`: `https://your-app-name.vercel.app`

### 3. Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod
```

## Option 2: Frontend on Vercel + Backend Elsewhere

### Frontend Deployment
1. Deploy only the `frontend` folder to Vercel
2. Set environment variable:
   - `REACT_APP_BACKEND_URL`: Your backend URL

### Backend Deployment Options

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add
railway deploy
```

#### Render
1. Create new web service on Render
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### Heroku
```bash
# Create Procfile in backend folder
echo "web: uvicorn server:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create your-app-name
git subtree push --prefix backend heroku main
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

### Backend (.env)
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=tyria_tracker
```

## Build Commands

### Frontend
```bash
cd frontend
yarn install
yarn build
```

### Backend
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

- [ ] MongoDB connection working
- [ ] API endpoints responding
- [ ] Frontend can reach backend
- [ ] Progress tracking saves to database
- [ ] Event completion saves to database
- [ ] Daily reset functionality working
- [ ] Offline fallback working

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS allows your frontend domain
   - Check REACT_APP_BACKEND_URL is correct

2. **MongoDB Connection**
   - Verify connection string format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database name matches

3. **Environment Variables**
   - Variables must be set in Vercel dashboard
   - Frontend variables must start with REACT_APP_
   - Restart deployment after changing variables

4. **API Routes**
   - Ensure all API routes start with /api
   - Check vercel.json routing configuration

### Logs
```bash
# View deployment logs
vercel logs your-app-name

# View function logs
vercel logs your-app-name --follow
```

## Performance Optimization

1. **Frontend**
   - Code splitting enabled
   - Image optimization
   - Service worker for offline caching

2. **Backend**
   - Database connection pooling
   - Response caching for static data
   - Minimize cold starts

## Security

1. **Environment Variables**
   - Never commit secrets to git
   - Use Vercel's environment variable system
   - Rotate database credentials regularly

2. **API Security**
   - HTTPS only
   - Rate limiting (consider Vercel Edge Functions)
   - Input validation

## Monitoring

1. **Vercel Analytics**
   - Enable Web Analytics
   - Monitor Core Web Vitals
   - Track deployment frequency

2. **Database Monitoring**
   - MongoDB Atlas metrics
   - Connection pool monitoring
   - Query performance

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Test API endpoints independently
4. Verify environment variables