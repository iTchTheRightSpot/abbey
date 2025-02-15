import express, { Application, Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import * as u from '@utils/index';
import * as e from '@entry/index';
import * as m from '@middlewares//index';

export const createApp = (logger: u.ILogger, services: e.ServicesRegistry) => {
  const app: Application = express();

  app.use(m.middleware.log(logger));
  app.use(
    cors({
      origin: [u.env.UI_URL],
      credentials: true
    })
  );
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    expressjwt({
      secret: u.env.JWT_PUB_KEY,
      algorithms: ['RS256'],
      credentialsRequired: true,
      getToken: (req) => req.cookies[u.env.COOKIENAME]
    }).unless({
      path: [
        `${u.env.ROUTE_PREFIX}auth/register`,
        `${u.env.ROUTE_PREFIX}auth/login`
        // new RegExp(`${u.env.ROUTE_PREFIX}auth`)
      ]
    })
  );
  app.set('trust proxy', 1);

  // routes
  const router = Router();
  e.initializeHandlers(router, logger, services);

  app.use(u.env.ROUTE_PREFIX, router);

  app.use(m.middleware.error(logger));

  return app;
};
