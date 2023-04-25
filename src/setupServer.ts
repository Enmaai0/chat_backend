import { Application, json, urlencoded, Response, Request, NextFunction, application, request, response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import Logger from 'bunyan';
import 'express-async-errors';
import HTTP_STATUS from 'http-status-codes';
import { config } from './config';
import applicationRoutes from './route';
import { CustomError, IErrorResonse } from './shared/globals/helpers/error-handler';

const SERVER_PORT = 3700;
const log: Logger = config.createLogger('server');

export class myServer {
    private app: Application;

    constructor (app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void{
        app.use(cookieSession({
            name: 'session',
            keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
            maxAge: 3600 * 24 * 7 * 1000,
            secure: config.NODE_ENV !== 'development'
        }));

        app.use(hpp());
        app.use(helmet());
        app.use(cors({
            origin: config.CLIENT_URL,
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'DELETE', 'POST', 'PUT', 'OPTIONS']
        }));
    }

    private standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({ limit: '50mb' }));
        app.use(urlencoded({ limit: '50mb', extended: true }));
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            this.startHttpServer(httpServer);
        } catch (error) {
            log.error(error);
        }
    }

    private startHttpServer(httpServer: http.Server): void {
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server running on port ${SERVER_PORT}`);
        })
    }

    private routesMiddleware(app: Application): void {
        applicationRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
             res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` })
        });

        app.use((error: IErrorResonse, _req: Request, res: Response, next: NextFunction) => {
            log.error(error);
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json(error.serializeErrors);
            }
            next();
        });
    }
}