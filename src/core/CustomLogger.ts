import winston from 'winston';
import config from 'config';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

const LOG_DIRECTORY = 'logs';
const LOG_LEVEL: LogLevel = config.get('log.level');
const LOG_TO_CONSOLE: boolean = config.get('log.toConsole');
const LOG_TO_FILE: boolean = config.get('log.toFile');
const LOG_ENABLED: boolean = config.get('log.enabled');

const customFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  }
);

class CustomLogger {
  private logger: winston.Logger;

  private enabled: boolean;

  constructor(name: string, enabled: boolean = LOG_ENABLED) {
    this.enabled = enabled;

    const transports: winston.transport[] = [];

    // Add file transports if logging to file is enabled
    if (LOG_TO_FILE) {
      transports.push(
        new winston.transports.File({
          filename: `${LOG_DIRECTORY}/error.log`,
          level: LogLevel.ERROR,
        }),
        new winston.transports.File({
          filename: `${LOG_DIRECTORY}/combined.log`,
        })
      );
    }

    // Add console transport if logging to console is enabled
    if (LOG_TO_CONSOLE && this.enabled) {
      transports.push(new winston.transports.Console());
    }

    this.logger = winston.createLogger({
      level: LOG_LEVEL,
      format: winston.format.combine(
        winston.format.label({ label: name }),
        winston.format.timestamp(),
        customFormat
      ),
      defaultMeta: { service: 'user-service' },
      transports,
    });
  }

  public log(level: LogLevel, message: string, ...meta: unknown[]): void {
    if (LOG_ENABLED) {
      this.logger.log(level, message, ...meta);
    }
  }

  public error(message: string, ...meta: unknown[]): void {
    this.logger.error(message, ...meta);
  }

  public warn(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.WARN, message, ...meta);
  }

  public info(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.INFO, message, ...meta);
  }

  public http(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.HTTP, message, ...meta);
  }

  public verbose(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.VERBOSE, message, ...meta);
  }

  public debug(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...meta);
  }

  public silly(message: string, ...meta: unknown[]): void {
    this.log(LogLevel.SILLY, message, ...meta);
  }
}

export default CustomLogger;
