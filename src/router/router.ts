import KoaRouter from '@koa/router';
import Service from '../service/Service.js';
import PersonRouter from './PersonRouter.js';
import AdministratorRouter from './AdministratorRouter.js';
import GroupRouter from './GroupRouter.js';

class Router {
  private readonly router: KoaRouter;

  private readonly service: Service;

  public readonly personRouter: PersonRouter;

  public readonly administratorRouter: AdministratorRouter;

  public readonly groupRouter: GroupRouter;

  constructor(router: KoaRouter, service: Service) {
    this.router = router;
    this.service = service;

    this.personRouter = new PersonRouter(
      this.router,
      this.service.personService
    );

    this.administratorRouter = new AdministratorRouter(
      this.router,
      this.service.administratorService
    );

    this.groupRouter = new GroupRouter(this.router, this.service.groupService);
  }

  public routes() {
    return this.router.routes();
  }

  public allowedMethods() {
    return this.router.allowedMethods();
  }
}

export default Router;
