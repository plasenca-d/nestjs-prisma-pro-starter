import { registerAs } from '@nestjs/config';

interface AppConfig {
  port: number;
  environment: string;
  apiVersion: string;
  frontendUrl: string;
  apiUrl: string;
  allowedOrigins: string[];
  throttle: {
    ttl: number;
    limit: number;
  };
  requestTimeout: number;
  features: {
    swaggerEnabled: boolean;
    debugMode: boolean;
    maintenanceMode: boolean;
  };
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
}

export default registerAs<AppConfig>('app', () => {
  return {
    // Basic Configuration
    port: parseInt(process.env.PORT ?? '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',

    // Frontend Configuration: URLs and CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],

    // Rate Limiting
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    },

    // Timeouts
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT ?? '30000', 10),

    // Features flags
    features: {
      swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
      debugMode: process.env.DEBUG_MODE === 'true',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    },

    // Pagination
    pagination: {
      defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT ?? '20', 10),
      maxLimit: parseInt(process.env.MAX_PAGE_LIMIT ?? '100', 10),
    },
  };
});
