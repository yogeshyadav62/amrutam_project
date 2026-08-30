import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Amrutam Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }

    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permissions:', e);
    return false;
  }
}

export async function triggerBookingNotification(doctorName: string, slotDate: string, slotTime: string) {
  try {
    await requestNotificationPermissions();
    const title = 'Appointment Confirmed! 🩺';
    const body = `Your consultation with ${doctorName} is confirmed for ${slotDate} at ${slotTime}.`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { doctorName, slotDate, slotTime },
      },
      trigger: null, // send immediately
    });
  } catch (e) {
    console.warn('Error triggering booking notification:', e);
  }
}

export async function triggerLocalNotification(title: string, body: string) {
  try {
    await requestNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null,
    });
  } catch (e) {
    console.warn('Error triggering local notification:', e);
  }
}
