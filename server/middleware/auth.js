import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        // Standardize usage: some routes use req.user.id, some req.user.userId.
        // The token payload has { userId, role }.
        // Let's ensure req.user has { id: userId, role, ...decoded }
        req.user = { ...decoded, id: decoded.userId };
        next();
    } catch (e) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// RBAC Middleware
export const requireRole = (roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
};

export const isSuperAdmin = requireRole(['SUPERADMIN']);
export const isAdmin = requireRole(['SUPERADMIN', 'ADMIN']);
export const isAccountant = requireRole(['SUPERADMIN', 'ACCOUNTANT']);
export const anyAdmin = requireRole(['SUPERADMIN', 'ADMIN', 'ACCOUNTANT']);

// Legacy helper compatibility
export const isOps = isAdmin;
export const isFinance = isAccountant;
