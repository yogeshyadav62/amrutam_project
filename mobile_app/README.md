# Amrutam Senior React Native Assignment — Ayurvedic Super App

A production-ready, high-performance **Ayurvedic Super App** built for the **Amrutam Senior React Native Assignment** featuring a **Node.js + Express.js Backend Server** and an **Offline-First Expo React Native Frontend**.

---

## 🌟 Key Functional Modules

1. **🩺 Consultation Module**
   - **Scale:** Supports **5,000 Doctors** with zero UI lag.
   - **Virtualized Rendering:** Optimized `FlatList` with memoized `DoctorCard` component.
   - **Search & Multi-filter:** Search by doctor name/specialty, filter by specialty, experience, rating, fee, availability.
   - **Slot Picker & Edge Case Handling:** Real-time slot availability, expired slot validation, slot conflict warning, and double booking prevention.
   - **Booking Flow & Cancellations:** Seamless booking flow with instant cancellation.

2. **🛍️ Shop Module**
   - **Scale:** Supports **20,000 Products** with smooth 60 FPS infinite scroll.
   - **Search, Multi-filter & Sorting:** Filter by Category, Price Range; Sort by Popularity, Rating, Price Low-High, Price High-Low.
   - **Product Details & Wishlist:** Item detail page with ingredients, size, description, and wishlist toggle.
   - **Offline Persistent Cart & Checkout:** Cart operations, quantity updates, subtotal, discount, delivery fees, and grand total persisted locally via **MMKV Storage**.

3. **📋 Health Records Module**
   - **Scale:** Supports **10,000 Health Records** timeline.
   - **Month/Year Grouping:** Chronological `SectionList` grouped by Month & Year (e.g., "August 2026", "July 2026").
   - **Exact 5 Record Types Supported:**
     - `Lab Report`
     - `Prescription`
     - `Consultation`
     - `Vaccination`
     - `Allergy`
   - **Search, Tags & Attachment Previews:** Search records by doctor/clinic, filter by tags (`#Prakriti`, `#BloodTest`), and modal previews for Image & PDF document thumbnails.

---

## 🚀 Node.js + Express.js Backend Server

A dedicated **Express.js REST API Server** located in `./server` serving all required endpoints:

- `GET /api/doctors` — Paginated list & filter across 5,000 doctors.
- `GET /api/doctors/:id/slots` — Real-time slot availability.
- `POST /api/bookings` — Slot booking with conflict & double booking checks.
- `GET /api/products` — Paginated infinite scroll across 20,000 products.
- `GET /api/health-records` — Timeline records grouped by Month/Year across 10,000 items.
- `POST /api/sync` — Offline booking queue automatic background sync endpoint.

---

## ⚡ Technical Architecture & Performance Optimization

### 1. State Management & Storage Engine
- **State Management:** **Zustand** — Lightweight, ultra-fast global state stores (`useCartStore`, `useBookingStore`, `useHealthRecordStore`, `useNetworkStore`).
- **Local Storage:** **MMKV Storage** (`react-native-mmkv`) — High performance key-value storage engine used for persistent cart, response cache, and offline queue.

### 2. Offline-First & Reliability Engine
- **Offline Response Caching:** Cached API responses served seamlessly when internet is unavailable.
- **Offline Persistent Cart:** Cart operations work completely offline.
- **Offline Booking Queue:** Bookings created offline transition: `Local Queue -> Pending -> Automatic Sync on reconnect`.
- **Automatic Background Sync:** `NetInfo` listener triggers background synchronization as soon as network connection is restored.

### 3. Virtualized Performance Optimizations
- Virtualized `FlatList` and `SectionList` configured with `initialNumToRender={10}`, `maxToRenderPerBatch={10}`, `windowSize={5}`, `removeClippedSubviews={true}` ensuring **60 FPS UI performance across 35,000 combined dataset items**.

---

## 🎯 3 Selected Bonus Features (Strictly 3)

1. **🔗 Deep Linking (`amrutam://...`):**
   - Configured via Expo Router URL scheme (`amrutam://doctor/doc_1`, `amrutam://product/prod_1`, `amrutam://cart`).
2. **🌐 Localization (English & Hindi):**
   - Bilingual support (`en` and `hi`) implemented via `react-i18next` with local language persistence.
3. **🔄 Background Synchronization:**
   - Background sync service monitoring network status and pushing queued offline bookings to Express backend automatically.

---

## 📂 Folder Structure

```text
amrutam/
├── server/                   # Node.js + Express.js Backend Server
│   ├── index.js              # Express REST API Server (Port 5000)
│   └── package.json
├── src/
│   ├── app/                  # Expo Router File-based Navigation Pages
│   │   ├── _layout.tsx       # Root Layout (ErrorBoundary, Toast, NetworkBanner)
│   │   ├── (tabs)/           # 3 Tabs: Consultation, Shop, Health Records
│   │   │   ├── _layout.tsx   # Native Bottom Tab Layout
│   │   │   ├── index.tsx     # Consultation Screen (5k Doctors)
│   │   │   ├── shop.tsx      # Shop Screen (20k Products)
│   │   │   └── health-records.tsx # Health Records Timeline (10k Records)
│   │   ├── doctor/[id].tsx   # Doctor Details & Slot Booking
│   │   ├── product/[id].tsx  # Product Details Screen
│   │   ├── cart.tsx          # Persistent Cart & Checkout Summary
│   │   └── booking-success.tsx # Upcoming Consultations & Cancel Booking
│   ├── api/                  # API Abstraction & Express REST Client Layer
│   │   ├── mockGenerators.ts # Synthetic data generators for 35k dataset items
│   │   ├── mockServer.ts     # Express REST client with local fallback
│   │   ├── doctorApi.ts      # Doctor API methods with MMKV caching
│   │   ├── shopApi.ts        # Shop API methods with MMKV caching
│   │   └── healthRecordsApi.ts # Health Records API methods
│   ├── store/                # Zustand Stores (Cart, Booking, HealthRecords, Network)
│   ├── services/             # MMKV Storage, Logger, i18n Localization, Sync Engine
│   ├── components/           # Reusable Modular UI Components & Modals
│   ├── types/                # Strongly Typed TypeScript Interfaces
│   └── __tests__/            # Automated Unit & Integration Test Suite
├── tailwind.config.js        # NativeWind / TailwindCSS Configuration
└── tsconfig.json
```

---

## 🛠️ Instructions to Run the Application

### 1. Start Node.js + Express Backend Server
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Start Expo React Native Application
```bash
# In the root project directory
npm install
npm run start
# Press 'w' for web, 'a' for Android, or 'i' for iOS
```

### 3. Run Automated Tests
```bash
npx tsc --noEmit
```
