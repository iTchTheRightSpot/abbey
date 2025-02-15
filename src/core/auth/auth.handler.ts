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
    this.register();
  }

  private readonly register = () => {
    this.router.post(
      '/auth/register',
      m.middleware.validatePayload(this.logger, c.RegisterAccountPayload),

      this.create
    );
    this.router.post(
      '/auth/login',
      m.middleware.validatePayload(this.logger, c.LoginPayload),
      this.login
    );

    this.router.post('/auth/login', this.logout);
  };

  private readonly create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.register(req.body as c.RegisterAccountPayload);
      res.status(201).send({});
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
          expires: obj.exp,
          httpOnly: true,
          secure: u.env.COOKIESECURE,
          sameSite: u.env.COOKIE_SAMESITE
        })
        .send({});
    } catch (e) {
      next(e);
    }
  };

  private readonly logout: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {};
}
