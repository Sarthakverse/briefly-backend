import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import adapterRoutes from './routes/adapters';
import releaseRoutes from './routes/releases';
import enhancementRoutes from './routes/enhancements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/adapters', adapterRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/enhancements', enhancementRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Briefly AI API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});