# StayEase - Hotel Booking System

A production-ready single-customer hotel booking system for Tirupati with AI chatbot integration.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Copy environment file and update values
cp .env.example .env

# Start MongoDB (if local)
# mongod

# Seed sample data
node src/utils/seed.js

# Start server
npm run dev
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on: http://localhost:3000

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stayease.com | admin123 |
| User | user@stayease.com | user123 |

## Features

### User Features
- 🏠 Beautiful home page with search
- 🛏️ Room listing with filters
- 📸 Room details with gallery
- 📅 Booking flow with payment
- 👤 User authentication
- 📋 Booking history

### Admin Features
- 📊 Dashboard with analytics
- 🛏️ Room management (CRUD)
- 📅 Booking management
- 👥 Customer overview

### AI Chatbot
- 💬 24/7 AI assistant
- 🌐 Multilingual (English + Telugu)
- 🔍 Room availability queries
- 🛕 Tirupati travel assistance

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Payment**: Razorpay (sandbox)
- **AI**: OpenAI GPT (optional)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - List rooms
- `GET /api/rooms/:id` - Get room details
- `GET /api/rooms/:id/availability` - Check availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - User's bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics/revenue` - Revenue data

### Chatbot
- `POST /api/chatbot/chat` - Chat with AI

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stayease
JWT_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Razorpay (Sandbox)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

OPENAI_API_KEY=sk-xxx (optional)
FRONTEND_URL=http://localhost:3000
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Google People API"
4. Go to Credentials -> Create OAuth Client ID -> Web Application
5. Add "http://localhost:3000" to Authorized JavaScript origins
6. Add "http://localhost:5000/api/auth/google/callback" to Authorized redirect URIs
7. Copy Client ID and Secret to `.env`

### Razorpay Setup
1. Sign up for [Razorpay](https://dashboard.razorpay.com/)
2. Switch to "Test Mode"
3. Copy Key ID and Key Secret to `.env`

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Project Structure

```
StayEase/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & constants
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── app.js        # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── package.json
└── README.md
```

## License

MIT
