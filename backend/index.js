const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDatabase } = require('./src/config/database');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected via Socket.io WebSocket: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined socket room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas Database
connectDatabase();

// Route Modules
const doctorRoutes = require('./src/routes/doctor.routes');
const productRoutes = require('./src/routes/product.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const healthRecordRoutes = require('./src/routes/healthRecord.routes');
const syncRoutes = require('./src/routes/sync.routes');
const notificationRoutes = require('./src/routes/notification.routes');

// Mount Routers
app.use('/api/doctors', doctorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', syncRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Amrutam Node.js + Express.js Backend Server API is active!',
    endpoints: [
      '/api/doctors',
      '/api/products',
      '/api/bookings',
      '/api/health-records',
      '/api/notifications',
      '/api/stats',
      '/api/sync',
    ],
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Amrutam Modular Express Server with Socket.io running on http://0.0.0.0:${PORT}`);
});
