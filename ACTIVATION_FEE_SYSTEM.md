# Activation Fee System with Payment Proof

## Overview
Implemented a mandatory ₦3,000 activation fee system for new user registrations. Users must upload payment proof after registration, and admins must approve the payment before users can login.

## Key Features

### 1. Registration Flow
**Step 1: User Registration**
- User fills out registration form
- Selects membership tier
- Submits form
- Account created with `PENDING_APPROVAL` status
- User receives access token (for uploading proof only)

**Step 2: Payment Details**
- System displays company bank account details
- Shows activation fee amount (₦3,000)
- Provides payment instructions
- User makes bank transfer

**Step 3: Upload Payment Proof**
- User uploads screenshot/photo of payment receipt
- System validates image (max 5MB, images only)
- Payment proof saved with `PENDING` status
- Admins notified of new submission

**Step 4: Admin Approval**
- Admin reviews payment proof
- Admin approves or rejects
- If approved: User account activated
- User can now login

### 2. User Status Flow

```
Registration → PENDING_APPROVAL → (Admin Approves) → ACTIVE → Can Login
                                 ↓
                          (Admin Rejects) → Still PENDING_APPROVAL
```

### 3. Login Restrictions

Users with `PENDING_APPROVAL` status cannot login:
```json
{
  "message": "Your account is pending admin approval. Please wait for your activation payment to be verified.",
  "status": "PENDING_APPROVAL"
}
```

### 4. Database Schema

#### PaymentProof Model
```prisma
model PaymentProof {
  id              Int       @id @default(autoincrement())
  userId          Int
  user            User      @relation(fields: [userId], references: [id])
  amount          Float     // 3000 for activation
  proofImageUrl   String    // Path to uploaded image
  status          String    @default("PENDING") // PENDING, APPROVED, REJECTED
  adminId         Int?
  adminNote       String?
  processedAt     DateTime?
  createdAt       DateTime  @default(now())
}
```

#### User Status Values
- `PENDING_APPROVAL` - Waiting for activation payment approval
- `ACTIVE` - Approved and can login
- `SUSPENDED` - Temporarily blocked
- `BANNED` - Permanently blocked

### 5. Backend Implementation

#### New Endpoints

**GET /api/auth/company-account**
- Returns company bank account details
- Public endpoint (no auth required)
- Used to display payment information

```javascript
// Response
{
  "bankName": "First Bank",
  "accountNumber": "1234567890",
  "accountName": "ValueHills Cooperative"
}
```

**POST /api/auth/upload-activation-proof**
- Requires authentication (user token from registration)
- Accepts multipart/form-data with image file
- Validates file type and size
- Creates PaymentProof record
- Notifies admins

```javascript
// Request
POST /api/auth/upload-activation-proof
Authorization: Bearer <token>
Content-Type: multipart/form-data

proofImage: <file>
amount: 3000
type: "ACTIVATION"

// Response
{
  "message": "Payment proof uploaded successfully. Awaiting admin approval.",
  "proof": {
    "id": 1,
    "status": "PENDING"
  }
}
```

**POST /api/auth/signup**
- Modified to create user with `PENDING_APPROVAL` status
- No longer auto-activates account
- Returns token for proof upload

```javascript
// Response
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "status": "PENDING_APPROVAL"
  },
  "message": "Registration successful. Please complete payment and upload proof."
}
```

**POST /api/auth/login**
- Blocks `PENDING_APPROVAL` users
- Returns specific error message
- Allows login only for `ACTIVE` users

#### Admin Approval Endpoint

**POST /api/admin/payment-proofs/:id/approve**
- Approves payment proof
- Checks if amount is ₦3,000 (activation)
- If activation: Changes user status to `ACTIVE`
- Records transaction in ledger
- Sends notification to user

```javascript
// Request
POST /api/admin/payment-proofs/1/approve
Authorization: Bearer <admin_token>

{
  "adminNote": "Payment verified"
}

// Response
{
  "message": "Activation payment approved and user account activated"
}
```

### 6. Frontend Implementation

#### Multi-Step Registration Form

**Step 1: Registration Form**
- Personal information fields
- Tier selection
- Activation fee notice (₦3,000)
- Submit button: "Continue to Payment"

**Step 2: Payment Details**
- Company bank account display
- Payment amount (₦3,000)
- Payment instructions
- File upload for proof
- Submit button: "Submit Payment Proof"

**Step 3: Confirmation**
- Success message
- Pending approval notice
- Login credentials reminder
- "Go to Login Page" button

#### Visual Design

**Step Indicator**
```
[1] ──── [2] ──── [3]
Form   Payment  Done
```

**Payment Details Card**
```
┌─────────────────────────────────┐
│ 🏦 Company Bank Account         │
├─────────────────────────────────┤
│ Bank Name: First Bank           │
│ Account Number: 1234567890      │
│ Account Name: ValueHills        │
│ Amount to Pay: ₦3,000          │
└─────────────────────────────────┘
```

**Confirmation Screen**
```
┌─────────────────────────────────┐
│         ✓                       │
│  Registration Submitted!        │
│                                 │
│  ⏳ Pending Admin Approval      │
│                                 │
│  Your payment proof has been    │
│  uploaded. Wait for approval.   │
│                                 │
│  Username: johndoe123           │
│                                 │
│  [Go to Login Page]             │
└─────────────────────────────────┘
```

### 7. Admin Dashboard Integration

#### Payment Proofs Page
- Shows all pending activation payments
- Displays user information
- Shows uploaded proof image
- Approve/Reject buttons
- Amount indicator (₦3,000 = activation)

#### Activation Payments Filter
```javascript
// Filter activation payments
const activationPayments = paymentProofs.filter(p => p.amount === 3000);
```

#### User Status Indicator
- Shows `PENDING_APPROVAL` badge
- Highlights activation payments
- Links to user profile

### 8. File Upload Configuration

#### Multer Setup
```javascript
const storage = multer.diskStorage({
    destination: 'uploads/activation-proofs',
    filename: 'activation-{timestamp}-{random}.{ext}'
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'));
        }
    }
});
```

#### File Storage
- Location: `backend/uploads/activation-proofs/`
- Naming: `activation-{timestamp}-{random}.{ext}`
- Access: Via `/uploads/activation-proofs/{filename}`

### 9. Notifications

#### User Notifications

**After Upload**
```
Title: Payment Proof Submitted
Message: Your activation payment proof has been submitted. 
Please wait for admin approval.
```

**After Approval**
```
Title: Account Activated ✅
Message: Your activation payment has been approved! 
Your account is now active. You can login and start using the platform.
```

**After Rejection**
```
Title: Payment Rejected ❌
Message: Your payment proof for ₦3,000 has been rejected. 
Reason: {admin_note}
```

#### Admin Notifications

**New Submission**
```
Title: New Activation Payment
Message: {FirstName} {LastName} ({username}) has submitted 
activation payment proof
```

### 10. Transaction Ledger

#### Activation Fee Transaction
```javascript
{
  userId: 1,
  amount: 3000,
  type: 'ONBOARDING_FEE',
  ledgerType: 'COMPANY',
  direction: 'IN',
  status: 'SUCCESS',
  reference: 'ACTIVATION-1-1234567890',
  description: 'Account Activation Fee'
}
```

### 11. Security Features

#### File Validation
- Only image files accepted
- Maximum size: 5MB
- Stored in secure directory
- Unique filenames prevent conflicts

#### Authentication
- User must be authenticated to upload
- Only admins can approve/reject
- Audit logs for all actions

#### Status Checks
- Prevents duplicate submissions
- Validates user status before upload
- Blocks login for pending users

### 12. Testing Scenarios

#### Test 1: Complete Registration Flow
1. Fill registration form
2. Submit form
3. View company account details
4. Upload payment proof
5. Check pending status
6. Admin approves
7. Login successfully

#### Test 2: Login Before Approval
1. Register account
2. Upload payment proof
3. Try to login
4. Should see "pending approval" error
5. Cannot access dashboard

#### Test 3: Admin Approval
1. Login as admin
2. Navigate to payment proofs
3. See pending activation payment
4. View uploaded proof image
5. Approve payment
6. User account activated

#### Test 4: File Upload Validation
1. Try to upload non-image file → Error
2. Try to upload >5MB file → Error
3. Upload valid image → Success

### 13. Files Modified/Created

#### Backend
- ✅ `backend/routes/auth.js` - Added upload endpoint, company account endpoint, modified signup/login
- ✅ `backend/routes/admin.js` - Modified approval endpoint to handle activation
- ✅ `backend/prisma/schema.prisma` - PaymentProof model already exists
- ✅ `backend/uploads/activation-proofs/` - NEW directory for uploads

#### Frontend
- ✅ `frontend/pages/Signup.jsx` - Complete redesign with 3-step flow
- ✅ Multi-step form with payment details
- ✅ File upload interface
- ✅ Confirmation screen

#### Documentation
- ✅ `ACTIVATION_FEE_SYSTEM.md` - This file

### 14. Configuration

#### Company Account Setup
Admins must configure company bank account:
1. Login as admin/superadmin
2. Navigate to Admin Funding page
3. Set company bank details:
   - Bank Name
   - Account Number
   - Account Name

These details are shown to users during registration.

### 15. User Experience Flow

```
User Journey:
1. Visit /signup
2. Fill form → Click "Continue to Payment"
3. See bank details → Make payment
4. Upload proof → Click "Submit Payment Proof"
5. See confirmation → Click "Go to Login Page"
6. Try to login → See "Pending approval" message
7. Wait for admin approval
8. Receive notification
9. Login successfully → Access dashboard
```

### 16. Admin Experience Flow

```
Admin Journey:
1. Receive notification of new activation payment
2. Navigate to Admin Payments page
3. Filter by "Pending" status
4. See activation payment (₦3,000)
5. Click to view proof image
6. Verify payment is legitimate
7. Click "Approve"
8. User account activated
9. User can now login
```

### 17. Error Handling

#### Registration Errors
- Duplicate username/email → Clear error message
- Invalid tier selection → Validation error
- Server error → User-friendly message

#### Upload Errors
- No file selected → "Please select a payment proof image"
- File too large → "File size must be less than 5MB"
- Invalid file type → "Only image files are allowed"
- Already uploaded → "Activation payment proof already submitted"

#### Login Errors
- Pending approval → Specific message with status
- Suspended account → "Account is suspended"
- Banned account → "Account is banned"
- Invalid credentials → "Invalid username or password"

### 18. Current Status
- ✅ Backend endpoints implemented
- ✅ Frontend multi-step form created
- ✅ File upload configured
- ✅ Admin approval logic updated
- ✅ Login restrictions added
- ✅ Notifications implemented
- ✅ Transaction ledger integrated
- ✅ Ready for testing

### 19. Next Steps (Optional Enhancements)

1. **Email Notifications**: Send emails for approval/rejection
2. **SMS Notifications**: Alert users via SMS
3. **Proof Preview**: Show image preview before upload
4. **Bulk Approval**: Approve multiple activations at once
5. **Auto-Approval**: AI-based payment verification
6. **Payment Gateway**: Direct payment integration
7. **Refund System**: Handle rejected payments
8. **Expiry**: Auto-reject old pending proofs
9. **Resubmission**: Allow users to resubmit rejected proofs
10. **Analytics**: Track activation approval rates

### 20. Production Checklist

Before deploying to production:
- [ ] Configure company bank account details
- [ ] Test complete registration flow
- [ ] Test admin approval process
- [ ] Verify file uploads work
- [ ] Check login restrictions
- [ ] Test notifications
- [ ] Verify transaction ledger
- [ ] Set up file backup system
- [ ] Configure email notifications (optional)
- [ ] Train admins on approval process

## Summary

The activation fee system is now fully implemented. New users must:
1. Register and provide details
2. Pay ₦3,000 activation fee to company account
3. Upload payment proof
4. Wait for admin approval
5. Login after approval

This ensures all users are verified and have paid the required activation fee before accessing the platform.
