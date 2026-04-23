const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware'); // Adjust based on your auth middleware

// Get notifications for logged-in user
router.get('/', authenticate, notificationController.getUserNotifications);

// Mark a single notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authenticate, notificationController.markAllAsRead);

// Get unread notification count for a user
router.get('/unread-count', authenticate, notificationController.getUnreadNotificationCount);

module.exports = router;
