import { Sequelize } from 'sequelize';

export type SequelizeConnection = {
    [key: string]: Sequelize;
};
