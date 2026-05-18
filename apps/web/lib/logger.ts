import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  base: { app: 'cupel-web', env: process.env.NODE_ENV },
  formatters: { level: (label) => ({ level: label }) },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: process.env.BETTERSTACK_SOURCE_TOKEN
    ? {
        target: '@logtail/pino',
        options: { sourceToken: process.env.BETTERSTACK_SOURCE_TOKEN },
      }
    : undefined,
});
