import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { UnauthorizedError } from 'express-jwt';
import * as u from '@utils/index';
import * as ex from '@exceptions/index';
import * as c from '@core/index';

export const middleware = {
  log: (log: u.ILogger) => logger(log),
  error: (log: u.ILogger) => error(log),
  validatePayload: <T extends object>(
    log: u.ILogger,
    type: ClassConstructor<T>
  ) => validatePayload(log, type),
  deconstructRequest: (log: u.ILogger, s: c.IJwtService) =>
    deconstructRequest(log, s)
};

// ref docs https://expressjs.com/en/resources/middleware/morgan.html
const logger = (log: u.ILogger) => {
  return morgan(
    (token: any, req: Request, res: Response) => {
      const clientIp =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        '';

      return JSON.stringify({
        method: token.method(req, res),
        url: token.method(req, res),
        status: Number.parseFloat(token.status(req, res)),
        content_length: token.res(req, res, 'content-length'),
        response_time: Number.parseFloat(token['response-time'](req, res)),
        IP: clientIp
      });
    },
    {
      stream: { write: (message: string) => log.log(message.trim()) }
    }
  );
};

const error = (logger: u.ILogger): express.ErrorRequestHandler => {
  return async (
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof ex.HttpException) {
      const status = err.status;
      const message = err.message;
      logger.error(err.stack);
      res.status(status).send({ message: message, status: status });
    } else if (err instanceof UnauthorizedError) {
      logger.error(err.stack);
      res.status(401).send({ message: err.message, status: 401 });
    } else {
      logger.error(err.stack);
      res.status(500).send({ message: 'something went wrong', status: 500 });
    }
    next();
  };
};

const validatePayload = <T extends object>(
  log: u.ILogger,
  type: ClassConstructor<T>
): express.RequestHandler => {
  return (req, res, next) => {
    validate(plainToInstance(type, req.body))
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors[0].constraints
            ? Object.values(errors[0].constraints)[0]
            : 'validation failed';

          log.error(`${validatePayload.name} request error ${message}`);

          res.status(400).send({ status: 400, message: message });
        } else next();
      })
      .catch((err) => {
        log.error(`${validatePayload.name} catch block ${JSON.stringify(err)}`);
        res
          .status(400)
          .send({ status: 400, message: 'catch validation failed' });
      });
  };
};

const deconstructRequest = (logger: u.ILogger, service: c.IJwtService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.cookies ||
      !req.cookies[u.env.COOKIENAME] ||
      req.path.endsWith('/logout')
    ) {
      next();
      return;
    }

    try {
      req.jwtClaim = await service.decode(req.cookies[u.env.COOKIENAME]);
      next();
    } catch (e) {
      logger.error(`${deconstructRequest.name} ${e}`);
      res.status(401).send({ message: 'unauthorized', status: 401 });
    }
  };
};
