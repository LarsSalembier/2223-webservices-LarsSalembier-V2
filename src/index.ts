import Koa from 'koa';
import Logger from './Logger.js';

const app = new Koa();
const logger = Logger.getInstance();

app.use(async (ctx, next) => {
  ctx.body = 'Hello World';
  await next();
});

app.use(async (_, next) => {
  await next();
});

logger.info(`🚀 Server listening on http://localhost:9000`);
app.listen(9000);
