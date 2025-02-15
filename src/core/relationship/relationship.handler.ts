import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router
} from 'express';
import * as u from '@utils/index';
import * as c from '@core/index';
import * as m from '@middlewares/index';

export class RelationshipHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: u.ILogger,
    private readonly service: c.IRelationshipService
  ) {
    this.registerRoutes();
  }

  private readonly registerRoutes = () => {
    this.router.post(
      '/relationship',
      m.middleware.validatePayload(this.logger, c.FollowPayload),
      this.follow
    );
  };

  private readonly follow: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.follow(req.body as c.FollowPayload);
      res.status(201).send();
    } catch (e) {
      next(e);
    }
  };
}
