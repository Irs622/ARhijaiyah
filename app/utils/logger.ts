// ============================================================
// logger.ts — Levelled Debug Logger
// ============================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
  none:  4,
};

class Logger {
  private level: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.level];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) console.debug('%c[DEBUG]', 'color:#888', ...args);
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) console.info('%c[INFO]', 'color:#4af', ...args);
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) console.warn('%c[WARN]', 'color:#fa0', ...args);
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) console.error('%c[ERROR]', 'color:#f44', ...args);
  }
}

/** Singleton logger — import this everywhere */
export const logger = new Logger();
