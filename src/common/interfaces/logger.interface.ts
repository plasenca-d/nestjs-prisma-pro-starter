export interface ILogger {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
}

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  message: string;
  timestamp: string;
  context?: string;
  trace?: string;
  metadata?: Record<string, any>;
}
