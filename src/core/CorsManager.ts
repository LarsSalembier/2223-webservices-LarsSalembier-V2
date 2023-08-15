import { Context } from 'koa';
import koaCors from '@koa/cors';
import config from 'config';

const CORS_ORIGINS: string = config.get('cors.origins');
const CORS_MAX_AGE: number = config.get('cors.maxAge');

class CorsManager {
  public static getCors() {
    return koaCors({
      origin: (ctx: Context) => {
        if (
          ctx.request.header.origin &&
          CORS_ORIGINS.indexOf(ctx.request.header.origin) !== -1
        ) {
          return ctx.request.header.origin;
        }
        // Not a valid domain at this point, let's return the first valid as we should return a string
        if (CORS_ORIGINS.length > 0) {
          return CORS_ORIGINS[0] as string;
        }
        throw new Error('No CORS origins defined');
      },
      allowHeaders: ['Accept', 'Content-Type', 'Authorization'],
      maxAge: CORS_MAX_AGE,
    });
  }
}

export default CorsManager;
