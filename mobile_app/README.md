# 📱 Amrutam Mobile Application (React Native Expo)

> High-performance cross-platform mobile app built with Expo Router v3, C++ Native MMKV Storage, Redux Toolkit, and Native Device Push Notifications.

---

## 🛠️ Tech Stack & Key Libraries
- **Framework**: React Native / Expo Router v3
- **Local Storage Engine**: `react-native-mmkv` (C++ Native 0.1ms Engine)
- **State Management**: Redux Toolkit & React-Redux
- **Styling**: NativeWind / Tailwind CSS
- **Icons**: Lucide React Native
- **Networking**: Axios & Socket.io-client

---

## 🚀 Commands & Execution

### 1️⃣ Run Development Server (Expo Android)
```bash
cd mobile_app
npx expo run:android
```

### 2️⃣ Fast Standalone Release APK Build
```bash
cd mobile_app/android
.\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a --daemon --parallel --build-cache
```
- **Generated APK Output Location**:  
  `mobile_app/android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Features & Offline Resilience Architecture

- **0.4s Instant App Launch**: Instant SplashScreen auto-hide and non-blocking MMKV cache load.
- **60–120 FPS Fast List Scrolling**: Restricts network image loading to the top 2 cards; uses 0ms initials badges (`Dr. AY`) for lower items.
- **100% Offline-First Mode**: Doctors, Products, Health Records, Cart, and Bookings display instantly in 0ms even with no internet connection.
- **Offline Queue Auto-Sync**: Automatically detects network reconnects and syncs pending bookings to MongoDB.
- **Smart Merge Redux Reducer**: Merges local offline appointments with server responses so new bookings are never overwritten.
- **1-Tap Cache Cleaner**: Accessible under Profile Settings to instantly clear MMKV local cache.
