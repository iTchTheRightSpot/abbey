import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router
} from 'express';
import * as u from '@utils/index';
import * as c from '@core/index';
import * as m from '@abbey/middlewares';

export class AccountHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: u.ILogger,
    private readonly service: c.IAccountService
  ) {
    this.register();
  }

  private readonly register = () => {
    this.router.get('/account', this.account);
    this.router.get('/accounts', this.accounts);
    this.router.patch(
      '/account',
      m.middleware.validatePayload(this.logger, c.AccountPayload),
      this.update
    );
  };

  private readonly account: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.status(401).send({
        message: 'full authentication is required to access this resource',
        status: 401
      });
      return;
    }
    try {
      const p = await this.service.account(req.jwtClaim!.obj);
      res.setHeader('Content-Type', 'application/json').status(200).send(p);
    } catch (e) {
      next(e);
    }
  };

  private readonly accounts: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.status(401).send({
        message: 'full authentication is required to access this resource',
        status: 401
      });
      return;
    }
    try {
      const p = await this.service.accounts(req.jwtClaim!.obj);
      res.setHeader('Content-Type', 'application/json').status(200).send(p);
    } catch (e) {
      next(e);
    }
  };

  private readonly update: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.status(401).send({
        message: 'full authentication is required to access this resource',
        status: 401
      });
      return;
    }
    try {
      await this.service.update(req.jwtClaim.obj, req.body as c.AccountPayload);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
