import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './db/database';
import authRoutes from './routes/auth';
import dadosRoutes from './routes/dados';
import scenarioRoutes from './routes/scenarios';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dados', dadosRoutes);
app.use('/api/scenarios', scenarioRoutes);

// Serve static frontend in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
