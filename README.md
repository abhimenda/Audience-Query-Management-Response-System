# Audience Query Management & Response System

A unified system that centralizes all incoming audience queries, categorizes and prioritizes them automatically, routes urgent issues to the right teams, and tracks progress.

## Features

- **Unified Inbox**: Centralized view of all queries from email, social media, chat, and community platforms
- **Auto-Tagging**: Automatically categorizes queries (question, request, complaint, etc.)
- **Priority Detection**: Intelligent priority detection and escalation
- **Assignment & Tracking**: Route queries to teams, track status, and maintain history
- **Analytics Dashboard**: Comprehensive analytics on response times, query types, and team performance

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: React, Tailwind CSS, Recharts
- **Features**: RESTful API, Real-time updates, Advanced filtering

## Installation

1. Install dependencies:
```bash
npm run install-all
```

2. (Optional) Seed the database with sample data:
```bash
npm run seed
```

3. Start the development server:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

## Usage

### Creating Queries

1. Click "New Query" button in the navigation
2. Fill in the query details (channel, sender, subject, content)
3. The system will automatically:
   - Detect and assign tags
   - Determine priority level
   - Suggest team assignment

### Managing Queries

- **Filter**: Use the filter bar to search and filter by status, priority, channel, etc.
- **Bulk Actions**: Select multiple queries to assign or update status in bulk
- **Update**: Click on a query to view details and update status, priority, or assignment

### Analytics

Visit the Analytics page to view:
- Query distribution by status, priority, and channel
- Tag distribution
- Response time trends
- Team performance metrics

## API Endpoints

### Queries
- `GET /api/queries` - Get all queries (with filters)
- `GET /api/queries/:id` - Get single query with history
- `POST /api/queries` - Create new query
- `PUT /api/queries/:id` - Update query
- `DELETE /api/queries/:id` - Delete query
- `POST /api/queries/bulk` - Bulk operations

### Analytics
- `GET /api/analytics/overview` - Overall statistics
- `GET /api/analytics/tags` - Tag distribution
- `GET /api/analytics/response-times` - Response time analytics
- `GET /api/analytics/trends` - Query trends
- `GET /api/analytics/teams` - Team performance

## Auto-Tagging

The system automatically detects tags based on content:
- **Question**: Contains question words (how, what, why, etc.)
- **Request**: Contains request keywords (please, need, want, etc.)
- **Complaint**: Contains negative sentiment keywords
- **Compliment**: Contains positive sentiment keywords
- **Bug Report**: Contains technical issue keywords
- **Feature Request**: Contains feature-related keywords
- And more...

## Priority Detection

Priority is automatically determined based on:
- Urgency keywords (urgent, asap, critical, etc.)
- Query type (complaints and bug reports are high priority)
- Urgency markers (multiple exclamation marks, all caps)

## Database Schema

- **queries**: Main query data
- **assignments**: Assignment history
- **status_history**: Status change history
- **teams**: Team information

## Development

- Backend: `npm run server`
- Frontend: `npm run client`
- Both: `npm run dev`

## License

MIT

