const { messaging } = require('../config/firebase');

const sendPushNotification = async (deviceToken, title, body) => {
  const message = {
    notification: { title, body },
    token: deviceToken,
  };
  await messaging.send(message);
};

module.exports = { sendPushNotification };
