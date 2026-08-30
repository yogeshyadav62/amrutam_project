# 💻 Amrutam Admin Panel Web Dashboard

> Ultra-fast Web Dashboard built with Vite, React 18, and Tailwind CSS for managing Doctors, Formulations, Patient Bookings, and Live WebSockets.

---

## 🛠️ Tech Stack
- **Build Tool**: Vite
- **UI Framework**: React 18
- **Styling**: Tailwind CSS & Lucide Icons
- **Real-Time Channel**: Socket.io-client
- **Live Deployment**: Vercel (`https://amrutam-project.vercel.app/#dashboard`)

---

## 🚀 Running Locally

```bash
# Navigate to admin panel directory
cd admin_panel

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Open `http://localhost:5173/#dashboard` in browser.*

---

## 📊 Dashboard Modules

1. 📈 **Analytics Overview**: Real-time stats cards for Total Revenue, Total Doctors, Total Formulations, and Active Appointments.
2. 🩺 **Doctor Management**: Add, edit, or toggle doctor consultation availability.
3. 🌿 **Formulations Store**: Manage Ayurvedic products, pricing, badges, and stock levels.
4. 📋 **Bookings Ledger**: Real-time view of all patient appointments across all slots.
5. ⚡ **WebSockets Live Sync**: Modifications automatically broadcast `products_updated` and `doctors_updated` events to all active mobile clients.
