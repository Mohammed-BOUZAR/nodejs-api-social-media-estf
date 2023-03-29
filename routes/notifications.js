const router = require('express').Router();
const { getNotifications, setNotification, putNotificationViewed, putNotificationRead, deleteNotifications, deleteNotification } = require('../controllers/NotificationControllers');

/**
 * Notifications
 */

router.get('/', getNotifications);
router.post('/', setNotification);

// Mark a notification as viewed
router.put('/:notificationId/viewed', putNotificationViewed);

// Mark all notifications as read
router.put('/read', putNotificationRead);

// Delete all notifications
router.delete('/', deleteNotifications);

// Delete notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;