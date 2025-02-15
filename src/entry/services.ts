import * as u from '@utils/index';
import * as e from '@entry/index';
import * as c from '@core/index';

// holds all class that perform some business logic
export interface ServicesRegistry {
  profile: c.IProfileService;
  auth: c.IAuthService;
  jwt: c.IJwtService;
}

// initializes all classes that perform business logic
export const initializeServices = (
  logger: u.ILogger,
  ads: e.Adapters
): ServicesRegistry => {
  const jwt = new c.JwtService(logger);
  const ps = new c.PasswordService(logger);
  return {
    auth: new c.AuthService(logger, ads, jwt, ps),
    profile: new c.ProfileService(logger, ads),
    jwt: jwt
  };
};
