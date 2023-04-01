const { User } = require('../models/user');

/**
 * Notifications
 */

module.exports.getNotifications = async (req, res) => {
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
};

module.exports.setNotification = async (req, res) => {
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
    res.json({ notifications: user.notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.putNotificationViewed = async (req, res) => {
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
    res.json({ url: user.notifications.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.putNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.notifications) {
      user.notifications.forEach(notification => {
        notification.state = 'read';
      });
    }
    await user.save();
    res.json({ notifications: user.notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.deleteNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.notifications = [];
    await user.save();
    res.json({ message: "No notification found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const user = await User.updateOne(
      { _id: req.userId },
      { $pull: { notifications: { _id: notificationId } } }
    );

    res.json({ notifications: user.notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
