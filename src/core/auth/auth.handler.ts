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

export class AuthHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: u.ILogger,
    private readonly service: c.IAuthService
  ) {
    this.registerRoutes();
  }

  private readonly registerRoutes = () => {
    this.router.post(
      '/auth/register',
      m.middleware.validatePayload(this.logger, c.RegisterAccountPayload),
      this.register
    );
    this.router.post(
      '/auth/login',
      m.middleware.validatePayload(this.logger, c.LoginPayload),
      this.login
    );
    this.router.post('/auth/logout', this.logout);
    this.router.get('/auth/active', this.active);
  };

  private readonly register: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.register(req.body as c.RegisterAccountPayload);
      res.status(201).send();
    } catch (e) {
      next(e);
    }
  };

  private readonly login: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const obj = await this.service.login(req.body as c.LoginPayload);
      res
        .status(204)
        .cookie(u.env.COOKIENAME, obj.token, {
          path: '/',
          expires: obj.exp,
          httpOnly: true,
          secure: u.env.COOKIESECURE,
          sameSite: u.env.COOKIE_SAMESITE
        })
        .send();
    } catch (e) {
      next(e);
    }
  };

  private readonly logout: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const cookie = req.cookies[u.env.COOKIENAME];
    if (!cookie) {
      res.setHeader('Content-Type', 'application/json').status(401).send({
        status: 401,
        message: 'full authentication is required to access this resource'
      });
      return;
    }
    res
      .cookie(u.env.COOKIENAME, cookie.value, {
        path: '',
        httpOnly: true,
        secure: u.env.COOKIESECURE,
        sameSite: u.env.COOKIE_SAMESITE,
        maxAge: -1
      })
      .status(204)
      .send();
    next();
  };

  private readonly active: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.jwtClaim) {
      res.setHeader('Content-Type', 'application/json').status(401).send({
        status: 401,
        message: 'full authentication is required to access this resource'
      });
      return;
    }
    res
      .setHeader('Content-Type', 'application/json')
      .status(200)
      .send({ user_id: req.jwtClaim.obj.user_id, name: req.jwtClaim.obj.name });
    next();
  };
}
