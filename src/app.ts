import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

const app = express();

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include curl, server-to-server calls, and mobile clients.
    if (!origin) return callback(null, true);

    const isConfiguredOrigin = config.corsOrigins.includes(origin);
    const isNgrokOrigin = config.allowNgrokOrigins
      && /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin);

    return callback(null, isConfiguredOrigin || isNgrokOrigin);
  },
}));
app.use(express.json({ limit: '5mb' }));

app.use('/api', routes);
app.use(errorHandler);

export default app;
