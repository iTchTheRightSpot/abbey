import { Router } from 'express';
import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

// holds all classes that expose endpoints
export const initializeHandlers = (
  rt: Router,
  lg: u.ILogger,
  reg: e.ServicesRegistry
) => {
  return {
    auth: new c.AuthHandler(rt, lg, reg.auth),
    account: new c.AccountHandler(rt, lg, reg.account),
    relationship: new c.RelationshipHandler(rt, lg, reg.relationship)
  };
};
