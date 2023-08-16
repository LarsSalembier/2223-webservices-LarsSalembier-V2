import jwksrsa from 'jwks-rsa';
import config from 'config';
import jwt from 'koa-jwt';
import { Context, Next } from 'koa';
import axios from 'axios';
import CustomLogger from './CustomLogger.js';
import { ServiceErrorType } from './ServiceError.js';

const AUTH_USER_INFO: string = config.get('auth.userInfo');

enum Permission {
  READ_USER = 'read-user',
  READ_ADMIN = 'read-admin',
  WRITE_ADMIN = 'write-admin',
}

class Auth {
  private static readonly logger: CustomLogger = new CustomLogger('Auth');

  static getJsonWebTokenSecret() {
    try {
      const secretFunction = jwksrsa.koaJwtSecret({
        jwksUri: config.get('auth.jwksUri'),
        cache: true,
        cacheMaxEntries: 5,
      });
      return secretFunction;
    } catch (err) {
      if (err instanceof Error) {
        Auth.logger.error(err.message, err);
      }
      throw err;
    }
  }

  static checkJsonWebToken() {
    try {
      const secretFunction = Auth.getJsonWebTokenSecret();
      return jwt({
        secret: secretFunction,
        audience: config.get('auth.audience'),
        issuer: config.get('auth.issuer'),
        algorithms: ['RS256'],
        passthrough: true,
      });
      // .unless({
      //   path: []
      // })
    } catch (err) {
      if (err instanceof Error) {
        Auth.logger.error(err.message, err);
      }
      throw err;
    }
  }

  static async addUserInfo(ctx: Context) {
    try {
      const token = ctx.headers.authorization;

      if (token && AUTH_USER_INFO && ctx.state.user) {
        Auth.logger.debug(
          `addUserInfo: ${AUTH_USER_INFO}, ${JSON.stringify(token)}`
        );

        const userInfo = await axios.get(AUTH_USER_INFO, {
          headers: {
            Authorization: token,
          },
        });

        ctx.state.user = {
          ...ctx.state.user,
          ...userInfo.data,
        };
      }
    } catch (err) {
      if (err instanceof Error) {
        Auth.logger.error(err.message, err);
      }
      throw err;
    }
  }

  static hasPermission(permission: Permission) {
    return async (ctx: Context, next: Next) => {
      const { user } = ctx.state;

      if (permission === Permission.READ_USER) {
        // anyone can read user
        await next();
      } else if (
        user &&
        user.permissions &&
        user.permissions.includes(permission)
      ) {
        await next();
      } else {
        ctx.throw(
          403,
          'You are not allowed to access this part of the application',
          {
            code: ServiceErrorType.FORBIDDEN,
          }
        );
      }
    };
  }
}

export default Auth;
