import { registerAs } from '@nestjs/config';

interface JWTConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  algorithm: string;
  issuer: string;
  audience: string;
  cookie: {
    name: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
    domain: string;
    maxAge: number;
  };
  blacklist: {
    enabled: boolean;
    redisPrefix: string;
    userPrefix: string;
    globalPrefix: string;
    trackReason: boolean;
    criticalOnly: boolean;
  };
}

export default registerAs<JWTConfig>('jwt', () => {
  return {
    // Secrets
    secret: process.env.JWT_SECRET || 'defaultSecret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshSecret',

    // Expiration
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // Algorithm
    algorithm: process.env.JWT_ALGORITHM || 'HS256',

    // Issuer/Audience
    issuer: process.env.JWT_ISSUER || 'nestjs-prisma-pro-starter',
    audience: process.env.JWT_AUDIENCE || 'nestjs-prisma-pro-starter',

    // Cookies(optional)
    cookies: {
      name: process.env.JWT_COOKIE_NAME || 'access_token',
      httpOnly: process.env.JWT_COOKIE_HTTP_ONLY === 'true',
      secure: process.env.JWT_COOKIE_SECURE === 'true',
      sameSite: process.env.JWT_COOKIE_SAME_SITE || 'strict',
      domain: process.env.JWT_COOKIE_DOMAIN || 'localhost',
      maxAge: parseInt(process.env.JWT_COOKIE_MAX_AGE || '900000', 10), // 15 min
    },

    blacklist: {
      enabled: process.env.JWT_BLACKLIST_ENABLED === 'true',
      redisPrefix: process.env.JWT_BLACKLIST_PREFIX || 'jwt_blacklist:',
      userPrefix: process.env.JWT_USER_PREFIX || 'user_',
      globalPrefix: process.env.JWT_GLOBAL_PREFIX || 'global_',
      trackReasons: process.env.JWT_TRACK_REASONS === 'true',
      criticalOnly: process.env.JWT_CRITICAL_ONLY === 'true',
    },
  };
});
