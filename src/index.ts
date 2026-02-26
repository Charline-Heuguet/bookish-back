import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import reviewRoutes from './routes/reviewRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Compteur de requêtes pour le monitoring
let requestCount = 0;
const startTime = Date.now();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Logging structuré avec morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// Compteur de requêtes (excluant /api/health et /api/metrics)
app.use((req, res, next) => {
  if (req.path !== '/api/health' && req.path !== '/api/metrics') {
    requestCount++;
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Endpoint de métriques
app.get('/api/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
    },
    requests: {
      total: requestCount,
      since: new Date(startTime).toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});