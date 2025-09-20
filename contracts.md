# Tyria Tracker - Backend Integration Contracts

## API Contracts

### Daily Progress Endpoints

#### GET /api/progress/:userId
- **Purpose**: Retrieve user's daily progress
- **Response**: 
```json
{
  "userId": "string",
  "date": "YYYY-MM-DD",
  "gathering": {
    "vine_bridge": boolean,
    "prosperity": boolean, 
    "destinys_gorge": boolean
  },
  "crafting": {
    "mithrillium": boolean,
    "elonian_cord": boolean,
    "spirit_residue": boolean,
    "gossamer": boolean
  },
  "specials": {
    "psna": boolean,
    "home_instance": boolean
  }
}
```

#### PUT /api/progress/:userId
- **Purpose**: Update user's daily progress
- **Request Body**: Same structure as GET response
- **Response**: Updated progress object

#### GET /api/events/:userId
- **Purpose**: Get user's completed events for today
- **Response**:
```json
{
  "userId": "string",
  "date": "YYYY-MM-DD", 
  "completedEvents": {
    "eventId": boolean
  },
  "completedEventTypes": {
    "eventKey": boolean
  }
}
```

#### PUT /api/events/:userId
- **Purpose**: Update completed events
- **Request Body**: Same structure as GET response
- **Response**: Updated events object

## Mock Data Migration

### Current Mock Data (to be replaced)
- **mockData.js**: Contains static event schedules, PSNA rotation, task definitions
- **Local Storage**: Currently persists user progress locally only

### Backend Integration Points
1. **Replace localStorage with API calls** in Dashboard.jsx
2. **Add user identification** (simple UUID-based for now)
3. **Maintain real-time updates** while syncing with backend
4. **Preserve daily reset functionality** with server-side validation

## Database Schema

### Collections

#### users_progress
```javascript
{
  _id: ObjectId,
  userId: String (UUID),
  date: String (YYYY-MM-DD),
  dailyProgress: {
    gathering: { vine_bridge: Boolean, ... },
    crafting: { mithrillium: Boolean, ... },
    specials: { psna: Boolean, ... }
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### users_events
```javascript
{
  _id: ObjectId,
  userId: String (UUID),
  date: String (YYYY-MM-DD),
  completedEvents: Object,
  completedEventTypes: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration Plan

### Changes Required:

1. **Add API Service Layer**
   - Create `src/services/api.js` for backend communication
   - Implement retry logic and error handling

2. **Update Dashboard.jsx**
   - Replace localStorage calls with API calls
   - Add user session management
   - Maintain offline capability with local fallback

3. **User Session Handling**
   - Generate UUID on first visit
   - Store in localStorage for session persistence
   - Sync local changes with backend on reconnection

4. **Real-time Sync Strategy**
   - Optimistic updates (update UI immediately)
   - Background sync with backend
   - Conflict resolution for concurrent updates

## Implementation Priority

1. ✅ **Frontend with mock data** (COMPLETED - working perfectly)
2. 🔄 **Backend API development** (NEXT)
3. 🔄 **Frontend-Backend integration** (AFTER API)
4. 🔄 **Testing and validation** (FINAL)

## Key Features to Maintain

- **Daily UTC reset functionality**
- **Real-time event countdowns** 
- **Progress bar animations**
- **Waypoint copying**
- **Offline capability with local storage fallback**
- **Cross-device sync when online**