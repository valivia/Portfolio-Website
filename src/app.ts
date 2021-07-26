import express, { Application } from "express";
import { PrismaClient } from "@prisma/client";
import logger from "morgan";
import handlebars from "express-handlebars";

import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";

import colors from "colors";
colors.enable();

import dotenv from "dotenv";
import path from "path";
dotenv.config();
const env = process.env

class App {
    public app: Application;
    public db: PrismaClient;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.db = this.initializeDB();

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(env.PORT, () => {
            console.log(` > Web server ready at port ${env.PORT} - ${env.NODE_ENV}`.magenta);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(logger("dev"));
        this.app.engine("handlebars", handlebars({ layout: false, defaultLayout: undefined }));
        this.app.set("view engine", "handlebars");
        this.app.set("views", path.join(__dirname, "views"));
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.set("trust proxy", true);
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            console.log(` > Loaded controller: ${controller.path}`.yellow)
            this.app.use('/', controller.router);
        });
    }

    private initializeDB() {
        return new PrismaClient();
    }

}

export default App;