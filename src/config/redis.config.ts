import { registerAs } from '@nestjs/config';

interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;

  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  defaultTtl: number;
  prefixes: {
    cache: string;
    session: string;
    queue: string;
    lock: string;
  };
  cluster: {
    enabled: boolean;
    nodes: string[];
  };
}

export default registerAs<RedisConfig>('redis', () => ({
  // Connection
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0', 10),

  // Config connection
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),

  // Default TTL
  defaultTtl: parseInt(process.env.REDIS_DEFAULT_TTL || '3600', 10), // 1 hour

  // Prefixed by Usage
  prefixes: {
    cache: process.env.REDIS_CACHE_PREFIX || 'cache:',
    session: process.env.REDIS_SESSION_PREFIX || 'session:',
    queue: process.env.REDIS_QUEUE_PREFIX || 'queue:',
    lock: process.env.REDIS_LOCK_PREFIX || 'lock:',
  },

  // Clustering (if use Redis Cluster)
  cluster: {
    enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
    nodes: process.env.REDIS_CLUSTER_NODES?.split(',') || [],
  },
}));
