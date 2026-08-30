# ⚙️ Amrutam Backend REST API & WebSockets Engine

> Production-ready Node.js Express REST API server backed by MongoDB Atlas, Mongoose aggregation pipelines, and Socket.io WebSockets.

---

## 🛠️ Tech Stack & Dependencies
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Real-Time Channel**: Socket.io
- **Deployment**: Render Cloud (`https://amrutam-project.onrender.com`)

---

## 🚀 Running Locally

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start local server (Port 5000)
npm run dev
```

---

## 📌 Environment Variables (`.env`)

```env
PORT=5000
MONGODB_URI=mongodb://yogeshyadavdev_db_user:yadavyogesh12@ac-lbqoouv-shard-00-00.knyx0z6.mongodb.net:27017,ac-lbqoouv-shard-00-01.knyx0z6.mongodb.net:27017,ac-lbqoouv-shard-00-02.knyx0z6.mongodb.net:27017/amrutam?ssl=true&authSource=admin&retryWrites=true&w=majority
NODE_ENV=development
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/doctors` | Paginated Doctor List | `page`, `pageSize`, `search`, `specialty`, `sortBy` |
| `GET` | `/api/doctors/:id` | Doctor Profile Details | - |
| `GET` | `/api/doctors/:id/slots` | 50-Patient Slot Availability | `date`, `patientId`, `patientEmail` |
| `GET` | `/api/products` | Paginated Ayurvedic Store | `page`, `pageSize`, `search`, `category`, `sortBy` |
| `GET` | `/api/products/:id` | Product Details | - |
| `GET` | `/api/health-records` | Grouped Patient Records | `page`, `pageSize`, `search`, `type`, `tag` |
| `POST` | `/api/bookings` | Create Appointment | `doctorId`, `slotId`, `dateStr`, `patientId` |
| `POST` | `/api/sync` | Offline Queue Auto-Sync | `pendingBookings: [...]` |
| `GET` | `/api/stats` | Admin Dashboard Analytics | - |

---

## 🎯 Database Indexes & Performance Optimizations
- **Compound Indexes**: `createdAt: -1`, `price: 1`, `rating: -1`, `type: 1` added across `Product` and `HealthRecord` schemas to prevent 32MB MongoDB memory limit sort crashes.
- **Field Selection**: `.select(...)` added to product list queries to shrink JSON payload by 85%.
