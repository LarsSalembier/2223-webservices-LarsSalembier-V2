import Koa from 'koa';
import KoaRouter from '@koa/router';

import { PrismaClient } from '@prisma/client';
import bodyParser from 'koa-bodyparser';
import Seeder from '../seeders/seeder.js';
import Service from '../service/service.js';
import Router from '../router/router.js';
import CorsManager from './CorsManager.js';
import CustomLogger from './CustomLogger.js';
import CustomPrismaClient from './CustomPrismaClient.js';
import RequestLogger from './RequestLogger.js';
import ErrorHandler from './ErrorHandler.js';
import Auth from './Auth.js';

const PORT = 9000;

class Server {
  private readonly serverLogger: CustomLogger;

  private readonly prismaLogger: CustomLogger;

  private readonly requestLogger: RequestLogger;

  private readonly prisma: PrismaClient;

  private readonly service: Service;

  private readonly koaRouter: KoaRouter;

  private readonly errorHandler: ErrorHandler;

  private readonly router: Router;

  private readonly seed: Seeder | null = null;

  public readonly app: Koa;

  constructor(seedDatabase: boolean = false) {
    // setup loggers
    this.serverLogger = new CustomLogger('Server');
    this.prismaLogger = new CustomLogger('Prisma', false);
    this.requestLogger = new RequestLogger(this.serverLogger);
    this.requestLogger.koaMiddleware = this.requestLogger.koaMiddleware.bind(
      this.requestLogger
    );

    // setup prisma client
    this.prisma = new CustomPrismaClient(this.prismaLogger);

    // setup service
    this.service = new Service(this.prisma);

    // setup error handler
    this.errorHandler = new ErrorHandler(this.serverLogger);
    this.errorHandler.koaMiddleware = this.errorHandler.koaMiddleware.bind(
      this.errorHandler
    );

    // setup router
    this.koaRouter = new KoaRouter();
    this.router = new Router(this.koaRouter, this.service);

    if (seedDatabase) {
      // setup seeds
      this.seed = new Seeder(this.service);
    }

    // setup koa app
    this.app = new Koa();
  }

  private async runServer() {
    // setup CORS
    this.app.use(CorsManager.getCors());

    // setup request logger
    this.app.use(this.requestLogger.koaMiddleware);

    // setup error handler
    this.app.use(this.errorHandler.koaMiddleware);

    this.app.use(Auth.checkJsonWebToken());

    // this.app.use(async (ctx, next) => {
    //   this.serverLogger.debug(ctx.headers.authorization ?? 'werkt niet'); // 👈 1
    //   this.serverLogger.debug(JSON.stringify(ctx.state.user)); // 👈 2
    //   this.serverLogger.debug(ctx.state.jwtOriginalError); // 👈 3
    //   await next();
    // });

    // setup body parser
    this.app.use(bodyParser());

    // setup routes
    this.app.use(this.router.routes()).use(this.router.allowedMethods());

    // run seeds
    if (this.seed != null) {
      await this.seed.run();
    }

    // start server
    this.app.listen(PORT);

    // log server startup
    this.serverLogger.info(`🚀 Server listening on http://localhost:9000`);
  }

  public async start() {
    await this.runServer()
      .then(async () => {
        await this.prisma.$disconnect();
      })
      .catch(async (e) => {
        this.prismaLogger.error(e);
        await this.stop();
        process.exit(1);
      });
  }

  public async stop() {
    this.app.removeAllListeners();
    await this.prisma.$disconnect();
    this.serverLogger.info('🪦 Server stopped');
  }
}

export default Server;
