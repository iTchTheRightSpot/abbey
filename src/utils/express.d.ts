import { JwtClaimsObject } from '@core/auth/auth.model';

declare global {
  namespace Express {
    interface Request {
      jwtClaim?: JwtClaimsObject;
    }
  }
}
