import KoaRouter from '@koa/router';
import Service from '../service/service.js';
import PersonRouter from './person.js';

class Router {
  private readonly router: KoaRouter;

  private readonly service: Service;

  public readonly personRouter: PersonRouter;

  constructor(router: KoaRouter, service: Service) {
    this.router = router;
    this.service = service;
    this.personRouter = new PersonRouter(
      this.router,
      this.service.personService
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
