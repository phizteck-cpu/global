# Project Restructure Plan

## Goal
Move backend from `./backend/` to root directory and switch from SQLite to MySQL

## Changes Required

### 1. File Moves
- Move all files from `backend/*` to root `./`
- Keep frontend in `frontend/` directory
- Update all relative imports

### 2. Database Changes
- Switch from SQLite to MySQL
- Update Prisma schema provider
- Create new DATABASE_URL format

### 3. Configuration Updates
- Update .env.production with MySQL credentials
- Update package.json scripts
- Update server.js (no longer needed)
- Update .gitignore

### 4. Import Path Updates
All files that import from relative paths need updates:
- `./loadEnv.js` stays the same
- `./app.js` stays the same
- `./prisma/client.js` stays the same
- All route imports stay the same

## Execution Steps

1. Create new .env.production with MySQL config
2. Update Prisma schema for MySQL
3. Move backend files to root (manual or script)
4. Update package.json
5. Delete old server.js
6. Test locally
7. Push to GitHub

## Risk Assessment
- HIGH: Breaking all imports if paths are wrong
- MEDIUM: Database migration from SQLite to MySQL
- LOW: Configuration issues

## Recommendation
Use git to track changes and test thoroughly before deploying.
