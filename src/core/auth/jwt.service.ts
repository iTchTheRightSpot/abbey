import * as jwt from 'jsonwebtoken';
import * as u from '@utils/index';
import * as c from '@core/index';
import * as ex from '@exceptions/index';

export class JwtService implements c.IJwtService {
  constructor(private readonly logger: u.ILogger) {}

  encode(obj: c.JwtObject, expirationInSeconds: number): c.JwtResponse {
    const date = new Date();
    const expireAt = new Date();
    expireAt.setSeconds(date.getSeconds() + expirationInSeconds);

    const claims: c.JwtClaimsObject = {
      obj: obj,
      iss: 'Abbey Fullstack challenge',
      iat: Math.floor(date.getTime() / 1000),
      exp: Math.floor(expireAt.getTime() / 1000)
    };

    const token = jwt.sign(claims, u.env.JWT_PRIV_KEY, { algorithm: 'RS256' });

    return { token: token, exp: expireAt };
  }

  async decode(token: string): Promise<c.JwtClaimsObject> {
    try {
      return (await jwt.verify(token, u.env.JWT_PUB_KEY)) as c.JwtClaimsObject;
    } catch (e) {
      this.logger.error(e);
      throw new ex.UnauthorizedException();
    }
  }
}
