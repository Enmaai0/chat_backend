import mongoose, { mongo } from "mongoose";
import Logger from "bunyan";
import { config } from "./config";

const log: Logger = config.createLogger('setUpDatabase');

export default () => {
    const connect = () => {
        mongoose.connect(`${config.DATABASE_URL}`)
            .then(() => {
                log.info('Successfully connected to database');
            })
            .catch((error) => {
                log.error('Error connecting to database', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};