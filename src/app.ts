import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const isConfiguredOrigin = config.corsOrigins.includes(origin);

    return callback(null, isConfiguredOrigin);
  },
}));
app.use(express.json({ limit: '5mb' }));

app.use('/api', routes);
app.use(errorHandler);

export default app;
