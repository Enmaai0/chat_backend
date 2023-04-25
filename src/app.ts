import express, { Express } from 'express';
import { myServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application {
    public initilize(): void {
        this.loadConfig();
        databaseConnection();
        const app: Express = express();
        const server: myServer = new myServer(app);
        server.start();
    }

    private loadConfig(): void {
        config.validateConfig();
    }
}

const application: Application = new Application();
application.initilize();