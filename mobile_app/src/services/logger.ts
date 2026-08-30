type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = __DEV__;

  private formatMessage(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string, context?: any) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message), context ?? '');
    }
  }

  warn(message: string, context?: any) {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message), context ?? '');
    }
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage('error', message), error ?? '');
  }

  debug(message: string, context?: any) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), context ?? '');
    }
  }
}

export const logger = new Logger();
