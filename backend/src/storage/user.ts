import { UserRecord } from './../../types/records.types';
import { QueryTypes } from "sequelize";
import { compareSync, hash } from 'bcrypt';
import { 
  AUTH_PREFIX, 
  AUTH_TTL, 
  LOGIN_LOCK_MAX, 
  LOGIN_LOCK_PREFIX, 
  LOGIN_LOCK_TTL,
  RECOVERY_TTL,
  RECOVERY_PREFIX,
  RESET_LOCK_PREFIX,
  RESET_LOCK_TTL,
  RESET_LOCK_MAX,
  LoginResult } 
from "../../types/auth.types";
import { redis, sequelize } from './';
import * as securePin from "secure-pin";

export default class User {
  public async login(handle: string, password: string): Promise<string[]> {
    const canLogin = await this.canLogin(handle, password);

    if(!canLogin) {
      return [];
    }

    const roles = await sequelize.query(`
      SELECT DISTINCT u.id AS user, r.role AS role, u.password AS password FROM auth.roles r 
        INNER JOIN auth.user_roles ur ON ur.role_id = r.id 
        INNER JOIN auth.users u ON u.id = ur.user_id
          WHERE u.handle = :handle AND u.deleted IS NULL
      `, {
        type: QueryTypes.SELECT,
        replacements: {
          handle
        }
      }) as LoginResult[];

    const authorized = roles.filter(result => {
      return compareSync(password, result.password);
    }).map(result => {
      return result.role;
    });

    if (authorized.length > 0) {
      const [loginResult] = roles;
      authorized.unshift(loginResult.user + '');
    }

    return authorized;
  }

  public async whoami(id: string): Promise<UserRecord> {
    const [user] = await sequelize.query(`
      SELECT id, handle, email FROM auth.users WHERE id = :id
    `, {
      type: QueryTypes.SELECT,
      replacements: {
        id
      }
    }) as UserRecord[];

    return user;
  }

  public async whois(conn: string): Promise<string[]> {
    const authstring = await redis.get(AUTH_PREFIX + conn);

    if (authstring) {
      return authstring.split(' ');
    }

    return [];
  }

  public async logout(conn: string): Promise<number> {
    return redis.del(AUTH_PREFIX + conn);
  }

  public async authorize(conn: string, authorized: string[]): Promise<string[]> {
    const expires = Date.now() + AUTH_TTL + '';

    await redis.multi()
        .set(AUTH_PREFIX + conn, authorized.join(' '))
        .pexpireat(AUTH_PREFIX + conn, expires)
        .exec();

    authorized.shift();

    authorized.unshift(expires);
    
    return authorized;
  }

  public async deauthorize(handle: string, conn: string): Promise<string[]> {
    const expires = Date.now() + LOGIN_LOCK_TTL + '';

    const results = await redis.multi()
        .del(AUTH_PREFIX + conn)
        .incr(LOGIN_LOCK_PREFIX + handle)
        .pexpireat(LOGIN_LOCK_PREFIX + handle, expires)
        .exec();

    const counter = (results[1][1] ?? 1) as number;
    let attempts = LOGIN_LOCK_MAX - counter;

    if (attempts < 0) {
      attempts = 0;
    }

    const deauthorize = [attempts + ''];

    if (counter >= LOGIN_LOCK_MAX) {
      deauthorize.push(expires);
    } 

    return deauthorize;
  }

  private async canLogin(handle: string, password: string): Promise<boolean> {
    if (!handle || !password) {
      return false;
    }

    const counter = parseInt(await redis.get(LOGIN_LOCK_PREFIX + handle) ?? '0');

    return counter < LOGIN_LOCK_MAX;
  }

  public async recoverPassword(handle: string): Promise<[string | null, string | null]> {
    const [user] = await sequelize.query(`
      SELECT id, handle, email FROM auth.users WHERE handle = :handle
    `, {
      type: QueryTypes.SELECT,
      replacements: {
        handle
      }
    }) as UserRecord[];

    if (user) {
      const code = securePin.generatePinSync(6);
      const expires = Date.now() + RECOVERY_TTL + '';
      const lock = await redis.set(RECOVERY_PREFIX + handle, code, 'PXAT', expires, 'NX');

      if (lock) {
        return [code, expires];
      } else {
        let expireAt = await redis.pexpiretime(RECOVERY_PREFIX + handle);

        if (expireAt < 0) {
          expireAt = 0;
        }

        return [null, expireAt + ''];
      }
    }

    return [null, null];
  }

  public async resetPassword(handle: string, pin: string, password: string): Promise<[boolean, string | null]> {
    const expires = Date.now() + RESET_LOCK_TTL + '';
    const results = await redis.multi()
        .incr(RESET_LOCK_PREFIX + handle)
        .pexpireat(RESET_LOCK_PREFIX + handle, expires)
        .exec();

    const counter = (results[0][1] ?? 1) as number;

    if (counter > RESET_LOCK_MAX) {
      return [false, expires];
    }
    else if (password && password.length > 0) {
      const code = await redis.get(RECOVERY_PREFIX + handle);

      if (code && code === pin) {
        await redis.del(RECOVERY_PREFIX + handle);
        await sequelize.query(`
          UPDATE auth.users SET password=:password WHERE handle=:handle
        `, {
          replacements: {
            handle,
            password: await hash(password, 15)
          }
        });
      }
    }

    return [false, null];
  }
}
