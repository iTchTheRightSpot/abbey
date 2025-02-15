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

export class ProfileHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: u.ILogger,
    private readonly service: c.IProfileService
  ) {
    this.register();
  }

  private readonly register = () => {
    this.router.get('/profile', this.profile);
    this.router.patch(
      '/profile',
      m.middleware.validatePayload(this.logger, c.ProfilePayload),
      this.update
    );
  };

  private readonly profile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.status(401).send();
      return;
    }
    try {
      const p = await this.service.profile(req.jwtClaim!.obj);
      res.status(200).send(p);
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
      res.status(401).send();
      return;
    }
    try {
      await this.service.update(
        req.jwtClaim!.obj,
        req.body as c.ProfilePayload
      );
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
