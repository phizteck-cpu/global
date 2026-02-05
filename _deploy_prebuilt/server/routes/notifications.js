import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /notifications - List user's notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PUT /notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.notification.update({
            where: { 
                id: parseInt(id),
                userId: req.user.userId
            },
            data: { read: true }
        });
        
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// PUT /notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { 
                userId: req.user.userId,
                read: false
            },
            data: { read: true }
        });
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// GET /notifications/unread-count - Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const count = await prisma.notification.count({
            where: { 
                userId: req.user.userId,
                read: false
            }
        });
        
        res.json({ unreadCount: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

// DELETE /notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.notification.delete({
            where: { 
                id: parseInt(id),
                userId: req.user.userId
            }
        });
        
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
