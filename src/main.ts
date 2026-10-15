import { createApp } from './presentation/http/app.js';
import { loadConfig } from './config/env.js';
import { PostgresClient } from './infrastructure/database/postgres.client.js';
import { RedisClient } from './infrastructure/cache/redis.client.js';

const start = async (): Promise<void> => {
  const config = loadConfig();
  const database = new PostgresClient(config.databaseUrl);
  const cache = new RedisClient(config.redisUrl);

  await database.verifyConnection();
  await cache.connect();
  await cache.verifyConnection();

  const app = createApp(database, config.jwtSecret, config.stripeSecretKey);
  const server = app.listen(config.port, () => {
    console.log(`http://localhost:${config.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`Received ${signal}, shutting down`);
    const closeDependencies = async (): Promise<void> => {
      await Promise.all([database.close(), cache.close()]);
      process.exit(0);
    };
    server.close(() => {
      void closeDependencies();
    });
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

start().catch((error: unknown) => {
  if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
    console.error(
      'Failed to connect to a required service. Start PostgreSQL and Redis, then run npm run dev again.',
    );
  }
  console.error('Failed to start API', error);
  process.exitCode = 1;
});
