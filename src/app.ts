import express, { Application } from "express";
import logger from "morgan";
import handlebars from "express-handlebars";

import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";

import path from "path";
import NotFoundException from "./exceptions/notFound";
import { Container } from "typedi";
import { PrismaClient } from "@prisma/client";

const env = process.env;

class App {
    private db: PrismaClient;
    private app: Application;

    constructor(
        controllers: Controller[]
    ) {
        this.app = express();
        this.db = this.initializeDB();
        
        Container.set([
            { id: 'prisma.client', value: this.db },
        ]);

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private initializeDB() {
        return new PrismaClient();

    }

    private initializeMiddlewares() {
        this.app.engine("handlebars", handlebars({ defaultLayout: undefined }));
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "handlebars");
        this.app.set("trust proxy", true);
        this.app.use(logger("dev"));
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            console.log(` - Loaded controller: ${controller.path}`.yellow)
            this.app.use('/', controller.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use((_req, _res, next) => { next(new NotFoundException); });
        this.app.use(errorMiddleware);
    }

    public getServer() {
        return this.app;
    }

    public listen() {
        this.app.listen(env.PORT, () => {
            console.log(` > Web server ready at port ${env.PORT} - ${env.NODE_ENV}`.magenta);
        });
    }
}

export default App;