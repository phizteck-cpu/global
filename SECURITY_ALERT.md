# 🚨 SECURITY ALERT - IMMEDIATE ACTION REQUIRED

## Critical Security Issues Found

### 1. Exposed Production Credentials

**File:** `backend/.env.production`

This file contains hardcoded production credentials and is currently tracked in git:
- JWT_SECRET (exposed)
- DATABASE_URL with password (exposed)
- Database credentials visible in commit history

### Immediate Actions Required:

1. **Rotate All Secrets Immediately:**
   ```bash
   # Generate new JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Change Database Password:**
   - Log into Hostinger phpMyAdmin
   - Change the database user password
   - Update `.env.production` locally (DO NOT commit)

3. **Remove from Git History:**
   ```bash
   # Remove the file from git tracking
   git rm --cached backend/.env.production
   
   # Commit the removal
   git commit -m "Remove exposed credentials from git"
   
   # Push to remote
   git push origin main
   ```

4. **Use GitHub Secrets for CI/CD:**
   - Go to GitHub Repository Settings > Secrets and variables > Actions
   - Add these secrets:
     - `JWT_SECRET`
     - `MYSQL_ROOT_PASSWORD`
     - `MYSQL_PASSWORD`
     - `PAYSTACK_SECRET`
     - `PAYSTACK_PUBLIC`
     - `DOCKERHUB_USERNAME`
     - `DOCKERHUB_TOKEN`

5. **Use Template File:**
   - Copy `backend/.env.production.example` to `backend/.env.production`
   - Fill in your NEW credentials
   - Never commit `.env.production` again

### 2. Paystack Test Keys in Production

The current `.env.production` uses test keys (`sk_test_`, `pk_test_`).

**Action:** Replace with live keys from https://dashboard.paystack.com

### 3. CORS Configuration Too Permissive

**File:** `backend/app.js`

Current: `cors({ origin: '*', credentials: true })`

**Fix:** Restrict to specific domains:
```javascript
cors({ 
  origin: ['https://valuehills.shop', 'https://www.valuehills.shop'],
  credentials: true 
})
```

## Verification Checklist

- [ ] All secrets rotated
- [ ] Database password changed
- [ ] `.env.production` removed from git
- [ ] GitHub Secrets configured
- [ ] Paystack live keys configured
- [ ] CORS restricted to specific domains
- [ ] Server restarted with new credentials

## Prevention

- Never commit `.env*` files (except `.env.example`)
- Use environment variables or secret management services
- Regularly audit git history for exposed secrets
- Use tools like `git-secrets` or `truffleHog` to scan for secrets
