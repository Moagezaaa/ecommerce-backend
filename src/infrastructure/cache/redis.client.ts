import { createClient, type RedisClientType } from 'redis';

export class RedisClient {
  public readonly client: RedisClientType;

  public constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });
    this.client.on('error', (error: unknown) => {
      console.error('Redis client error', error);
    });
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public async verifyConnection(): Promise<void> {
    await this.client.ping();
  }

  public async close(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
