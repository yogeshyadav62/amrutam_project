const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const path = require('path');

let firebaseApp = null;

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
const alternativePath = path.join(__dirname, 'serviceAccountKey.json');

let keyPathToUse = null;
if (fs.existsSync(serviceAccountPath)) {
  keyPathToUse = serviceAccountPath;
} else if (fs.existsSync(alternativePath)) {
  keyPathToUse = alternativePath;
}

if (keyPathToUse) {
  try {
    const serviceAccount = require(keyPathToUse);
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized successfully with project:', serviceAccount.project_id);
  } catch (error) {
    console.warn('⚠️ Firebase credentials found but failed to initialize:', error.message);
  }
} else {
  console.log('ℹ️ Firebase service account file not found in src/config/. Real-time Socket.io notifications active.');
}

const sendFirebasePushNotification = async ({ title, body, token, topic = 'all_users' }) => {
  if (!firebaseApp) {
    console.log(`[Push Notification Simulated via WebSockets] Title: "${title}" | Body: "${body}"`);
    return { success: true, simulated: true };
  }

  try {
    const messaging = getMessaging(firebaseApp);
    const message = {
      notification: { title, body },
      topic,
    };
    if (token) {
      delete message.topic;
      message.token = token;
    }
    const response = await messaging.send(message);
    console.log('🚀 FCM Push Notification sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Firebase FCM Push Notification Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  firebaseApp,
  sendFirebasePushNotification,
};
