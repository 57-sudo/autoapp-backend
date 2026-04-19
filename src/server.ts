import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { initSocket } from './services/socket';

const server = http.createServer(app);
initSocket(server);

const start = async () => {
  await connectDB();
  server.listen(config.port, () => {
    console.log(`AutoApp API running on port ${config.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
