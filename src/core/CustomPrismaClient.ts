import { Prisma, PrismaClient } from '@prisma/client';
import config from 'config';
import CustomLogger from './CustomLogger.js';

const LOG_TO_FILE = config.get('log.toFile');

class CustomPrismaClient extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query' | 'info' | 'warn' | 'error'
> {
  constructor(logger: CustomLogger) {
    super({
      log: [
        {
          level: 'query',
          emit: 'event',
        },
        {
          level: 'info',
          emit: 'event',
        },
        {
          level: 'warn',
          emit: 'event',
        },
        {
          level: 'error',
          emit: 'event',
        },
      ],
      errorFormat: LOG_TO_FILE ? 'colorless' : 'pretty',
    });

    this.setupLogging(logger);
  }

  private setupLogging(logger: CustomLogger) {
    this.$on('query', (e) => {
      logger.debug(
        `Query: ${e.query}, Params: ${JSON.stringify(e.params)}; Duration: ${
          e.duration
        }ms; Target: ${e.target}`
      );
    });
    this.$on('info', (e) => {
      logger.info(`${e.message}, Target: ${e.target}`);
    });
    this.$on('warn', (e) => {
      logger.warn(`${e.message}, Target: ${e.target}`);
    });
    this.$on('error', (e) => {
      logger.error(`${e.message}, Target: ${e.target}`);
    });
  }
}

export default CustomPrismaClient;
