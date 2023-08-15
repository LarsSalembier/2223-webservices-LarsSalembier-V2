import Koa from 'koa';
import KoaRouter from '@koa/router';

import { PrismaClient } from '@prisma/client';
import Seeder from '../seeders/seeder.js';
import Service from '../service/service.js';
import Router from '../router/router.js';
import CorsManager from './CorsManager.js';
import CustomLogger from './CustomLogger.js';
import CustomPrismaClient from './CustomPrismaClient.js';

const PORT = 9000;

class Server {
  private readonly serverLogger: CustomLogger;

  private readonly prismaLogger: CustomLogger;

  private readonly prisma: PrismaClient;

  private readonly service: Service;

  private readonly seed: Seeder | null = null;

  private readonly koaRouter: KoaRouter;

  private readonly router: Router;

  private readonly app: Koa;

  constructor(seedDatabase: boolean = false) {
    // setup loggers
    this.serverLogger = new CustomLogger('Server');
    this.prismaLogger = new CustomLogger('Prisma');

    // setup prisma client
    this.prisma = new CustomPrismaClient(this.prismaLogger);

    // setup service
    this.service = new Service(this.prisma);

    if (seedDatabase) {
      // setup seeds
      this.seed = new Seeder(this.service);
    }

    // setup router
    this.koaRouter = new KoaRouter();
    this.router = new Router(this.koaRouter, this.service);

    // setup koa app
    this.app = new Koa();
  }

  private async runServer() {
    // setup CORS
    this.app.use(CorsManager.getCors());

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
        await this.stop();
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
    this.serverLogger.info('Server stopped');
  }
}

export default Server;
