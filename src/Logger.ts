import winston from 'winston';

const LOG_DIRECTORY = 'logs';

const customFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  }
);

class Logger {
  private static instance: Logger;

  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'MAIN' }),
        winston.format.timestamp(),
        customFormat
      ),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.File({
          filename: `${LOG_DIRECTORY}/error.log`,
          level: 'error',
        }),
        new winston.transports.File({
          filename: `${LOG_DIRECTORY}/combined.log`,
        }),
      ],
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public error(message: string): void {
    this.logger.error(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }

  public verbose(message: string): void {
    this.logger.verbose(message);
  }

  public silly(message: string): void {
    this.logger.silly(message);
  }

  public log(level: string, message: string): void {
    this.logger.log(level, message);
  }
}

export default Logger;
