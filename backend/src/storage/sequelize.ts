import { Sequelize } from 'sequelize';
import { SequelizeConnection } from '../../types/storage.types';

export default class SequelizeConnector {
  private static instance: SequelizeConnector;
  private pool: SequelizeConnection = {};

  private constructor() {}

  public static get(): SequelizeConnector {
    if (! SequelizeConnector.instance) {
      SequelizeConnector.instance = new SequelizeConnector();
    }

    return SequelizeConnector.instance;
  }

  public get(url: string): Sequelize {
    if (!this.pool[url]) {
        this.pool[url] = new Sequelize(url, {
          logging: (message) => {
            if (process.env.NODE_ENV! === 'development') {
              console.log(message);
            }
          }
        });
    }

    return this.pool[url];

  }
}
