# Firmer Intern Quest Logging System

A web-based logging system for tracking activities with user authentication.
**Branch for evaluation:** `main`

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Express + TypeScript
- **Database**: MongoDB

## Quick Start with Docker
```bash
# Start all services (frontend, backend, MongoDB)
docker-compose up -d

# Stop all services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

**First-time setup**: On fresh build, MongoDB will automatically import seed data from `internQuest.user.json` and `internQuest.log.json`.

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   ├── Dockerfile
│   └── vite.config.ts
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── config/     # Database config
│   │   └── index.ts
│   └── Dockerfile
├── docker-init-mongo/   # MongoDB initialization scripts
│   ├── init-mongo.sh
│   ├── internQuest.user.json
│   └── internQuest.log.json
├── resource/            # MongoDB data persistence
└── docker-compose.yml
```

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/users` - List users
- `GET /api/logs` - List logs with filtering
