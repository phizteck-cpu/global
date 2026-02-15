import { body, validationResult } from 'express-validator';

// Standard Validation Rules
const validateSignup = [
    // Name Validation
    body('firstName').trim().notEmpty().withMessage('First Name is required'),
    body('lastName').trim().notEmpty().withMessage('Last Name is required'),

    // Username: Alphanumeric, min 3 chars
    body('username')
        .trim()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

    // Email: Valid format, normalized
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    // Password: Min 6 chars
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    // Phone: Optional, but if present must be numeric
    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .isMobilePhone().withMessage('Invalid phone number format'),

    // Check for errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation Error',
                errors: errors.array().map(err => err.msg)
            });
        }
        next();
    }
];

const validateAdminCreate = [
    // Similar to signup but allows role specification
    body('firstName').trim().notEmpty().withMessage('First Name is required'),
    body('lastName').trim().notEmpty().withMessage('Last Name is required'),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('username').trim().isLength({ min: 3 }).withMessage('Username min 3 chars'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN', 'ACCOUNTANT', 'MEMBER']).withMessage('Invalid Role'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation Error',
                errors: errors.array().map(err => err.msg)
            });
        }
        next();
    }
];

export { validateSignup, validateAdminCreate };
