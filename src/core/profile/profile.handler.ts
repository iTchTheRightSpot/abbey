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
    this.router.post(
      '/profile',
      m.middleware.validatePayload(this.logger, c.ProfilePayload),
      this.update
    );
  };

  private readonly update: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.update(req.body as c.ProfilePayload);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
