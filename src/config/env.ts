import 'dotenv/config';

type NodeEnvironment = 'development' | 'test' | 'production';

export interface AppConfig {
  readonly nodeEnv: NodeEnvironment;
  readonly port: number;
  readonly databaseUrl: string;
  readonly redisUrl: string;
  readonly jwtSecret: string;
  readonly stripeSecretKey?: string;
  readonly stripeWebhookSecret?: string;
}

const getRequired = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getPort = (): number => {
  const value = process.env.PORT ?? '3000';
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  return port;
};

export const loadConfig = (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  return {
    nodeEnv: nodeEnv as NodeEnvironment,
    port: getPort(),
    databaseUrl: getRequired('DATABASE_URL'),
    redisUrl: getRequired('REDIS_URL'),
    jwtSecret: getRequired('JWT_SECRET'),
    ...(process.env.STRIPE_SECRET_KEY ? { stripeSecretKey: process.env.STRIPE_SECRET_KEY } : {}),
    ...(process.env.STRIPE_WEBHOOK_SECRET
      ? { stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET }
      : {}),
  };
};
