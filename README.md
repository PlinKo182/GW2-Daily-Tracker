# 🗺️ Tyria Tracker

A comprehensive daily progress tracker for Guild Wars 2 players. Track your daily gathering, crafting, special tasks, and world boss events with real-time countdowns and cross-device synchronization.

![Tyria Tracker Dashboard](https://via.placeholder.com/800x400/1f2937/10b981?text=Tyria+Tracker+Dashboard)

## ✨ Features

### 📊 Daily Progress Tracking
- **Daily Gathering**: Track waypoint-based gathering tasks with one-click waypoint copying
- **Daily Crafting**: Monitor your daily crafting material production
- **Daily Specials**: PSNA rotation tracking and Home Instance management
- **Visual Progress**: Beautiful progress bars with real-time updates

### ⚔️ World Boss Events
- **Real-time Countdowns**: Live countdowns for all major world bosses
- **Event Filtering**: View upcoming (2h), all events, or completed events
- **Smart Notifications**: Active/upcoming status indicators
- **Completion Tracking**: Mark events as completed with persistent storage

### 🔄 Cross-Device Sync
- **Database Persistence**: Progress synced across all your devices
- **Offline Support**: Works offline with automatic sync when reconnected
- **Daily Reset**: Automatic UTC midnight reset following GW2 schedule

### 🎮 Guild Wars 2 Integration
- **Waypoint Copying**: One-click waypoint code copying for in-game use
- **PSNA Rotation**: Automatic daily PSNA location tracking
- **Event Schedules**: Accurate world boss and meta-event timers

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and Yarn
- MongoDB Atlas account (for database)
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/tyria-tracker.git
cd tyria-tracker

# Install frontend dependencies
cd frontend
yarn install

# Start development server
yarn start
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update environment variables:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8001
   MONGO_URL=your_mongodb_connection_string
   DB_NAME=tyria_tracker
   ```

## 🌐 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Alternative Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas, PlanetScale

## 🏗️ Tech Stack

### Frontend
- ⚛️ **React 19** - Modern React with concurrent features
- 🎨 **Tailwind CSS** - Utility-first styling
- 🧩 **Shadcn/ui** - Beautiful component library
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Vite** - Fast build tool and dev server

### Backend
- 🐍 **FastAPI** - High-performance Python API
- 🍃 **MongoDB** - Document database for flexible storage
- 🔄 **Motor** - Async MongoDB driver
- 🔐 **CORS** - Secure cross-origin requests

### Features
- 📊 **Real-time Updates** - Live countdown timers
- 💾 **Local Storage** - Offline fallback
- 🔄 **Auto-sync** - Background synchronization
- 📱 **PWA Ready** - Progressive Web App capabilities

## 📖 API Documentation

### Progress Endpoints
- `GET /api/progress/{userId}` - Get user's daily progress
- `PUT /api/progress/{userId}` - Update daily progress

### Events Endpoints  
- `GET /api/events/{userId}` - Get completed events
- `PUT /api/events/{userId}` - Update event completion

## 🎯 Roadmap

- [ ] **Push Notifications** - Browser notifications for upcoming events
- [ ] **Achievement Tracking** - Daily achievement progress
- [ ] **Guild Integration** - Share progress with guild members  
- [ ] **Mobile App** - Native mobile applications
- [ ] **API Keys** - GW2 API integration for character data
- [ ] **Statistics** - Long-term progress analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎮 Guild Wars 2

This is a fan-made tool for Guild Wars 2. Guild Wars 2 is a trademark of ArenaNet, LLC.

## 🙏 Acknowledgments

- ArenaNet for creating Guild Wars 2
- The GW2 community for event timing data
- Contributors and testers

---

**Made with ❤️ for the Guild Wars 2 community**