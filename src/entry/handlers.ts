import { Router } from 'express';
import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

// holds all classes that expose endpoints
export const initializeHandlers = (
  router: Router,
  logger: u.ILogger,
  services: e.ServicesRegistry
) => {
  return {
    authHandler: new c.AuthHandler(router, logger, services.auth),
    profileHandler: new c.ProfileHandler(router, logger, services.profile)
  };
};
