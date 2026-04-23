const Notification = require('../models/Notification');

const createNotification = async (recipientId, senderId, type, title, message, link) => {
  try {
    const notification = new Notification({
      recipientId,
      senderId,
      type,
      title,
      message,
      link
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

module.exports = { createNotification };
