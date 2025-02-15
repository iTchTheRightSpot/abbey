import { LogEntry, Logger } from 'winston';

export interface ILogger {
  log(...args: any[]): void;
  error(...args: any[]): void;
}

export class ProductionLogger implements ILogger {
  constructor(private readonly logger: Logger) {}

  error(...args: any[]): void {
    const entry: LogEntry = {
      level: 'error',
      message: args.join(' '),
      timestamp: new Date().toISOString()
    };
    this.logger.error(entry);
  }

  log(...args: any[]): void {
    const entry: LogEntry = {
      level: 'info',
      message: args.join(' '),
      timestamp: new Date().toISOString()
    };
    this.logger.info(entry);
  }
}

export class DevelopmentLogger implements ILogger {
  error(...args: any[]): void {
    const entry: LogEntry = {
      level: 'error',
      message: args.join(' '),
      timestamp: new Date().toISOString()
    };
    console.error(entry);
  }

  log(...args: any[]): void {
    const entry: LogEntry = {
      level: 'info',
      message: args.join(' '),
      timestamp: new Date().toISOString()
    };
    console.log(entry);
  }
}
