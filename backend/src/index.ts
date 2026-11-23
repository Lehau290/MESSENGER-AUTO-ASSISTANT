import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { SchedulerService, setSocketInstance } from './services/schedulerService';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Cấu hình Socket.io cho đồng bộ Web và Desktop
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

setSocketInstance(io);

// Middleware bảo mật
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter bảo vệ chống brute-force và spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Messenger Auto Assistant Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

// WebSocket kết nối
io.on('connection', (socket) => {
  console.log(`[Socket] Client kết nối: ${socket.id}`);

  // Khi client đăng nhập và tham gia room cá nhân
  socket.on('join', (userId: string) => {
    if (userId) {
      socket.join(userId);
      console.log(`[Socket] User ${userId} đã tham gia room cá nhân.`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client ngắt kết nối: ${socket.id}`);
  });
});

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Messenger Auto Assistant Backend đang chạy trên PORT: ${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`🔌 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);

  // Bắt đầu background cron job lập lịch nhắc nhở
  SchedulerService.init();
});

export { app, server, io };
