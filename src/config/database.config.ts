import { registerAs } from '@nestjs/config';

interface DatabaseConfig {
  url: string;
  connectionPoolSize: number;
  connectionTimeout: number;
  logLevel: string;
  logQueries: boolean;
  ssl:
    | boolean
    | {
        rejectUnauthorized: boolean;
      };
  migrationsDir: string;
  seedsDir: string;
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
}

export default registerAs<DatabaseConfig>('database', () => {
  return {
    // Principal Connection
    url: process.env.DATABASE_URL || '',

    // Connections Pool
    connectionPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    connectionTimeout: parseInt(process.env.DB_TIMEOUT || '5000', 10),

    // Logging
    logLevel: process.env.DB_LOG_LEVEL || 'info',
    logQueries: process.env.DB_LOG_QUERIES === 'true',

    // SSL
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,

    // Migrations
    migrationsDir: process.env.DB_MIGRATIONS_DIR || 'prisma/migrations',
    seedsDir: process.env.DB_SEEDS_DIR || 'prisma/seeds',

    // Backup and maintenance
    backup: {
      enabled: process.env.DB_BACKUP_ENABLED === 'true',
      schedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // 2 AM daily
      retention: parseInt(process.env.DB_BACKUP_RETENTION || '7', 10), // days
    },
  };
});
