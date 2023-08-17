import KoaRouter from '@koa/router';
import Service from '../service/service.js';
import PersonRouter from './person.js';
import AdministratorRouter from './administrator.js';
import GroupRouter from './group.js';

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
      this.service.groupService,
      this.service.personService,
      this.service.membershipService
    );

    this.administratorRouter = new AdministratorRouter(
      this.router,
      this.service.administratorService
    );

    this.groupRouter = new GroupRouter(
      this.router,
      this.service.groupService,
      this.service.personService,
      this.service.membershipService
    );
  }

  public routes() {
    return this.router.routes();
  }

  public allowedMethods() {
    return this.router.allowedMethods();
  }
}

export default Router;
