import joi from 'joi';

export const configValidationSchema = joi.object({
  // Basic Configuration
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: joi.number().default(3000),
  API_VERSION: joi.string().default('v1'),

  // Security
  THROTTLE_TTL: joi.number().default(60),
  THROTTLE_LIMIT: joi.number().default(100),

  // Database
  DATABASE_URL: joi.string().required(),

  // JWT
  JWT_SECRET: joi.string().required(),
  JWT_REFRESH_SECRET: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().default('15m'),

  // R2
  STORAGE_ENDPOINT: joi.string().required(),
  STORAGE_ACCESS_KEY_ID: joi.string().required(),
  STORAGE_SECRET_ACCESS_KEY: joi.string().required(),
  STORAGE_BUCKET: joi.string().required(),

  // Mail
  MAIL_HOST: joi.string().required(),
  MAIL_PORT: joi.number().default(587),
  MAIL_USER: joi.string().required(),
  MAIL_PASS: joi.string().required(),

  // Redis
  REDIS_HOST: joi.string().default('localhost'),
  REDIS_PORT: joi.number().default(6379),
});
