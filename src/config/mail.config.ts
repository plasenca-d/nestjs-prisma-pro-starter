import { registerAs } from '@nestjs/config';

type TemplatesEngine = 'handlebars' | 'ejs';

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  apiKey?: string | null;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
  templates: {
    dir: string;
    engine: TemplatesEngine;
  };
  queue: {
    enabled: boolean;
    redis: string;
    concurrency: number;
    attempts: number;
  };
  rateLimit: {
    max: number;
    window: number;
  };
  preview: boolean;
  testMode: boolean;
}

function convertToTemplateEngine(value?: string | null) {
  if (value === 'handlebars' || value === 'ejs') {
    return value;
  }
  return 'handlebars';
}

export default registerAs<MailConfig>('mail', () => {
  return {
    // SMTP
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    apiKey: process.env.MAIL_API_KEY,

    // Authentication
    auth: {
      user: process.env.MAIL_USER || 'defaultUser',
      pass: process.env.MAIL_PASS || 'defaultPass',
    },

    // Default sender
    from: {
      name: process.env.MAIL_FROM_NAME || 'My App',
      email: process.env.MAIL_FROM_EMAIL || 'noreply@myapp.com',
    },

    // Templates
    templates: {
      dir: process.env.MAIL_TEMPLATES_DIR || './src/templates/mail',
      engine: convertToTemplateEngine(process.env.MAIL_TEMPLATE_ENGINE),
    },

    // Colas
    queue: {
      enabled: process.env.MAIL_QUEUE_ENABLED === 'true',
      redis: process.env.MAIL_QUEUE_REDIS_URL || 'redis://localhost:6379',
      concurrency: parseInt(process.env.MAIL_QUEUE_CONCURRENCY || '5', 10),
      attempts: parseInt(process.env.MAIL_QUEUE_ATTEMPTS || '3', 10),
    },

    // Rate limiting
    rateLimit: {
      max: parseInt(process.env.MAIL_RATE_LIMIT_MAX || '100', 10), // Emails per hour
      window: parseInt(process.env.MAIL_RATE_LIMIT_WINDOW || '3600000', 10), // 1 hour
    },

    // Testing
    preview: process.env.MAIL_PREVIEW === 'true', // For development
    testMode: process.env.MAIL_TEST_MODE === 'true',
  };
});
