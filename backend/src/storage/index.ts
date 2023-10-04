import User from "./user";
import SequelizeConnection from "./sequelize";
import { RedisConnector } from "redis";

const sequelize = SequelizeConnection.get().get(process.env.DATABASE_URL!);
const redis = RedisConnector.get('backend').get(process.env.REDIS_URL!);

export {
    User,
    sequelize,
    redis,
};
