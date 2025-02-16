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
    this.router.patch(
      '/relationship',
      m.middleware.validatePayload(this.logger, c.FollowPayload),
      this.unfollow
    );
    this.router.get('/relationship', this.following);
  };

  private readonly following: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.setHeader('Content-Type', 'application/json').status(401).send({
        message: 'full authentication is required to access this resource',
        status: 401
      });
      return;
    }

    const { status } = req.params;

    if (
      ![
        c.RelationshipStatusParam.FOLLOWERS,
        c.RelationshipStatusParam.FOLLOWING,
        c.RelationshipStatusParam.FRIENDS
      ].some((en) => en === status)
    ) {
      res.setHeader('Content-Type', 'application/json').status(400).send({
        status: 400,
        message: 'bad request invalid request parameter'
      });
      return;
    }

    try {
      const arr = await this.service.following(
        req.jwtClaim.obj,
        status as c.RelationshipStatusParam
      );
      res.setHeader('Content-Type', 'application/json').status(200).send(arr);
    } catch (e) {
      next(e);
    }
  };

  private readonly follow: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.setHeader('Content-Type', 'application/json').status(401).send({
        message: 'full authentication is required to access this resource',
        status: 401
      });
      return;
    }

    try {
      await this.service.follow(req.jwtClaim.obj, req.body as c.FollowPayload);
      res.status(201).send();
    } catch (e) {
      next(e);
    }
  };

  private readonly unfollow: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.setHeader('Content-Type', 'application/json').status(401).send({
        message: 'full authentication is required to access this resource',
        status: 401
      });
      return;
    }

    try {
      await this.service.unfollow(
        req.jwtClaim.obj,
        req.body as c.FollowPayload
      );
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
