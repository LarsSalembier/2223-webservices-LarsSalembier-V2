import { Context, Next } from 'koa';
import CustomLogger from './CustomLogger.js';

function getStatusEmoji(status: number): string {
  if (status >= 500) return '💀';
  if (status >= 400) return '❌';
  if (status >= 300) return '🚀';
  if (status >= 200) return '✅';
  return '⏪';
}

class RequestLogger {
  private readonly logger: CustomLogger;

  constructor(logger: CustomLogger) {
    this.logger = logger;
  }

  public koaMiddleware = async (ctx: Context, next: Next) => {
    this.logger.info(`⏩ ${ctx.method} ${ctx.url}`);

    try {
      await next();

      this.logger.info(
        `${getStatusEmoji(ctx.status)} ${ctx.method} ${ctx.url} ${ctx.status} ${
          ctx.response.message
        }`
      );
    } catch (error) {
      this.logger.error(
        `$❗ ${ctx.method} ${ctx.url} ${ctx.status} ${ctx.response.message}: ${error}`
      );
      throw error;
    }
  };
}

export default RequestLogger;
