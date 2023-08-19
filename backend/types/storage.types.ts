import { Redis } from 'ioredis';
import { Sequelize } from 'sequelize';

export type RedisConnection = {
    [key: string]: Redis;
};

export type SequelizeConnection = {
    [key: string]: Sequelize;
};
