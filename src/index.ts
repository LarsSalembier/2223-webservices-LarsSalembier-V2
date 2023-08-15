import Koa from 'koa';
import KoaRouter from '@koa/router';

import { PrismaClient } from '@prisma/client';
import Router from './router/router.js';
import CorsManager from './core/CorsManager.js';
import Repository from './repository/repository.js';
import CustomPrismaClient from './core/CustomPrismaClient.js';
import Service from './service/service.js';
import CustomLogger from './core/CustomLogger.js';

const PORT = 9000;

// setup loggers
const serverLogger: CustomLogger = new CustomLogger('Server');
const prismaLogger: CustomLogger = new CustomLogger('Prisma');

// setup prisma client
const prisma: PrismaClient = new CustomPrismaClient(prismaLogger);

// setup repository
const repository: Repository = new Repository(prisma);

// setup service
const service: Service = new Service(repository);

// setup seed
// const seed: Seed = new Seed(repository);

// setup router
const koaRouter = new KoaRouter();
const router = new Router(koaRouter, service);

// setup koa app
const app = new Koa();

async function main() {
  // setup CORS
  app.use(CorsManager.getCors());

  // setup routes
  app.use(router.routes()).use(router.allowedMethods());

  // run seeds
  // await seed.personSeed.run();

  // start server
  app.listen(PORT);

  // log server startup
  serverLogger.info(`🚀 Server listening on http://localhost:9000`);
}

// prisma error management
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    prismaLogger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
