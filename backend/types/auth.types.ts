import { UserRecord } from "./records.types"

export type LoginResult = {
    role: string;
    password: string;
    user: number;
};
export type Identity = {
    user: UserRecord,
    roles: string[]
};


export const AUTH_PREFIX = 'AUTH::';
export const AUTH_TTL = 3_600_000;

export const OTL_PREFIX = 'OTL::';
export const OTL_TTL = 3_600_000;

export const LOGIN_LOCK_PREFIX = 'LOGIN_LOCK::';
export const LOGIN_LOCK_TTL = 3_600_000;
export const LOGIN_LOCK_MAX = 5;

export const RECOVERY_PREFIX = 'RECOVERY::';
export const RECOVERY_TTL= 3_600_000;

export const RESET_LOCK_PREFIX = 'RESET_LOCK::';
export const RESET_LOCK_TTL = 3_600_000;
export const RESET_LOCK_MAX = 5;
