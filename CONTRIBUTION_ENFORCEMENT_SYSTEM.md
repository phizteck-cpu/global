# Contribution Enforcement System

## Overview
The contribution enforcement system automatically monitors member payment compliance and takes action against users who miss weekly contributions.

## Enforcement Rules

### Suspension (3-5 Missed Weeks)
- Users who miss 3-5 consecutive weekly contributions are automatically SUSPENDED
- Suspended users cannot make contributions or access certain features
- They must contact support to resolve the issue

### Ban (10+ Missed Weeks)
- Users who miss 10 or more consecutive weekly contributions are automatically BANNED
- Banned users are permanently locked out of the system
- This is considered a violation of the cooperative agreement

## How It Works

### 1. Automated Daily Check
The system runs automatically every day at 1:00 AM to check all members:
- Counts missed weeks for each member with a tier
- Identifies users who need enforcement action
- Automatically suspends or bans users based on missed weeks
- Creates notifications and audit logs for all actions

### 2. Manual Trigger (Superadmin Only)
Superadmins can manually trigger enforcement at any time:

**Endpoint:** `POST /api/admin/run-enforcement`

**Headers:**
```
Authorization: Bearer <superadmin_token>
```

**Response:**
```json
{
  "message": "Enforcement completed successfully",
  "success": true,
  "suspended": 2,
  "banned": 1,
  "totalProcessed": 3
}
```

### 3. Enforcement Statistics
View current enforcement status for all members:

**Endpoint:** `GET /api/admin/enforcement-stats`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "pendingSuspensions": 5,
  "pendingBans": 2,
  "currentlySuspended": 8,
  "currentlyBanned": 3,
  "totalAtRisk": 18
}
```

### 4. Check Individual User
Check enforcement status for a specific user:

**Endpoint:** `GET /api/admin/users/:id/enforcement`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "userId": 4,
  "missedWeeks": 7,
  "shouldSuspend": false,
  "shouldBan": false,
  "status": "SUSPEND"
}
```

## Missed Week Calculation

The system counts missed weeks by:
1. Getting the user's last contribution payment date
2. Calculating how many weeks have passed since then
3. Comparing against the current week

**Example:**
- User last paid: January 1, 2026
- Current date: February 12, 2026
- Weeks passed: ~6 weeks
- Status: Should be SUSPENDED (3-5 weeks threshold exceeded)

## Notifications

When enforcement actions occur, the system:
1. Updates user status in database
2. Creates a notification for the user explaining the action
3. Creates an audit log entry for admin tracking
4. Logs the action to console for monitoring

### Suspension Notification
```
Title: Account Suspended ⚠️
Message: Your account has been suspended for missing X weekly contributions. 
Please contact support to resolve this issue.
```

### Ban Notification
```
Title: Account Banned 🚫
Message: Your account has been permanently banned for missing X weekly contributions. 
This is a violation of the cooperative agreement.
```

## Testing

### Test Script
Run the test script to check enforcement status:

```bash
node backend/test-enforcement.js
```

This will:
- Show enforcement statistics
- List all members with their contribution status
- Display missed weeks for each member
- Run enforcement (if any users need action)

### Manual Testing via API

1. **Check stats:**
```bash
curl -X GET http://localhost:5000/api/admin/enforcement-stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

2. **Run enforcement manually:**
```bash
curl -X POST http://localhost:5000/api/admin/run-enforcement \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN"
```

3. **Check specific user:**
```bash
curl -X GET http://localhost:5000/api/admin/users/4/enforcement \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Scheduled Jobs

The system uses `node-cron` to schedule automated tasks:

### Daily Contribution Processing
- **Schedule:** 00:00 (midnight)
- **Function:** `runDailyContributions()`
- **Purpose:** Process pending contributions

### Daily Enforcement Check
- **Schedule:** 01:00 (1 AM)
- **Function:** `enforceContributionPolicy()`
- **Purpose:** Check and enforce contribution compliance

## Files Modified

### Backend Files
1. **backend/services/contributionEnforcement.js** - Core enforcement logic
2. **backend/routes/admin.js** - Admin endpoints for enforcement
3. **backend/app.js** - Cron job scheduler
4. **backend/test-enforcement.js** - Test script

### Key Functions

#### `enforceContributionPolicy()`
Main enforcement function that:
- Gets all users needing enforcement
- Suspends users with 3-5 missed weeks
- Bans users with 10+ missed weeks
- Returns statistics

#### `countMissedWeeks(userId)`
Calculates how many consecutive weeks a user has missed payments

#### `getUsersForEnforcement()`
Returns list of all users who need enforcement action

#### `getEnforcementStats()`
Returns statistics about pending and current enforcement actions

#### `checkUserEnforcement(userId)`
Checks if a specific user should be suspended or banned

## Admin Dashboard Integration

To add enforcement stats to the admin dashboard:

1. Call `/api/admin/enforcement-stats` on dashboard load
2. Display pending suspensions and bans
3. Add a "Run Enforcement" button for superadmins
4. Show enforcement status in user list

## Security

- Only SUPERADMIN can manually trigger enforcement
- All enforcement actions are logged in audit logs
- Users receive notifications explaining the action
- System actions use adminId = 1 (system user)

## Future Enhancements

Potential improvements:
1. Grace period before suspension (warning notifications)
2. Automatic reinstatement after payment
3. Email notifications in addition to in-app
4. Configurable thresholds (admin can change 3-5-10 weeks)
5. Payment plan options for suspended users
6. Enforcement history tracking per user

## Troubleshooting

### Enforcement not running
- Check if cron job is initialized (look for console log on server start)
- Verify NODE_ENV is not 'test' (cron disabled in test mode)
- Check server logs for errors

### Users not being suspended/banned
- Verify users have tierId set (enforcement only applies to members with tiers)
- Check user status (already suspended/banned users are skipped)
- Run test script to see missed week calculations

### Manual trigger not working
- Verify user has SUPERADMIN role
- Check authentication token is valid
- Look for errors in server logs

## Summary

The contribution enforcement system is now fully integrated and operational. It will:
- ✅ Run automatically every day at 1 AM
- ✅ Suspend users after 3-5 missed weeks
- ✅ Ban users after 10+ missed weeks
- ✅ Send notifications to affected users
- ✅ Create audit logs for all actions
- ✅ Provide admin endpoints for monitoring and manual triggers

The system is production-ready and will help maintain payment discipline in the cooperative.
