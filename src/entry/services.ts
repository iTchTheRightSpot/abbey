import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

// holds all class that perform some business logic
export interface ServicesRegistry {
  account: c.IAccountService;
  auth: c.IAuthService;
  jwt: c.IJwtService;
  relationship: c.IRelationshipService;
}

// initializes all classes that perform business logic
export const initializeServices = (
  l: u.ILogger,
  ads: e.Adapters
): ServicesRegistry => {
  const jwt = new c.JwtService(l);
  return {
    auth: new c.AuthService(l, ads, jwt, new c.PasswordService(l)),
    account: new c.AccountService(l, ads),
    jwt: jwt,
    relationship: new c.RelationshipService(l, ads)
  };
};
