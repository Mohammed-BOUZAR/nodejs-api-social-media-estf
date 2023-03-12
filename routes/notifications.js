const router = require('express').Router();
const { User } = require('../models/user');

// Get all notifications for a user
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new notification for a user
router.post('/', async (req, res) => {
  try {
    const { type, content, url } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const notification = {
      type,
      content,
      url,
      state: 'unread',
      date: new Date()
    };
    user.notifications.push(notification);
    await user.save();
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a notification as viewed
router.put('/:notificationId/viewed', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const notification = user.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    notification.state = 'viewed';
    await user.save();
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/read', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.notifications.forEach(notification => {
      notification.state = 'read';
    });
    await user.save();
    res.json(user.notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;