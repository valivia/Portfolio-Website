import colors from "colors";
colors.enable();

import express, { NextFunction, Request, Response } from "express";
import handlebars from "express-handlebars";
import multer from "multer";
import helmet from "helmet";
import logger from "morgan";
import sass from "node-sass-middleware";
import path from "path";
import favicon from "serve-favicon";
import dotenv from "dotenv";
dotenv.config();
const env = process.env

import fileServer from "./routes/fileserver";
import index from "./routes/index";
import artwork from "./routes/artwork";
import browse from "./routes/browse";
import upload from "./routes/upload";

import newProject from "./posts/newProject";
import { PrismaClient } from ".prisma/client";

export default function webServer(db: PrismaClient) {

    const app = express();
    const mult = multer();

    // helmet.
    app.use(helmet({
        /*contentSecurityPolicy: {
            directives: {
                baseUri: ["'self'"],
                defaultSrc: ["'none'"],
                fontSrc: ["'self'"],
                formAction: ["'none'"],
                frameAncestors: ["'none'"],
                imgSrc: [
                    "'self'",
                    "https://cdn.discordapp.com/avatars/",
                    "https://cdn.discordapp.com/embed/avatars/",
                    "https://cdn.discordapp.com/icons/"
                ],
                objectSrc: ["'none'"],
                reportUri: "/report-violation",
                scriptSrc: [
                    "'self'",
                ],
                styleSrc: ["'self'"],
                upgradeInsecureRequests: true
            },
        },*/
        hidePoweredBy: true,
        referrerPolicy: false,
        reportOnly: (_req: Request) => env.ENV === "development"
    }));

    // view engine setup
    app.engine("handlebars", handlebars({ layout: false, defaultLayout: undefined }));
    app.set("view engine", "handlebars");
    app.set("views", path.join(__dirname, "views"));

    app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
    app.use(logger("dev"));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({
        type: [
            "application/json",
            "application/csp-report"
        ]
    }));
    app.set("trust proxy", true);
    app.use(sass({
        debug: false,
        dest: path.join(__dirname, "/public"),
        force: true,
        indentedSyntax: false,
        outputStyle: "compressed",
        src: __dirname
    }));

    // static files.
    app.use(express.static(path.join(__dirname, "public")));

    // CSP
    app.post("/report-violation", (_req, res) => {
        console.error("CONTENT SECURITY POLICY VIOLATION".red);
        res.sendStatus(200);
    });

    // GET ROUTES
    app.get("/file/:folder/:fileName", fileServer());
    app.get("/artwork", artwork());
    app.get("/browse", browse(db));
    app.get("/upload", upload(db));
    app.get("/", index());

    app.post("/upload", mult.single('banner'), newProject(db));


    // catch 404 and forward to error handler
    app.use((_req, res, next) => {
        const err = new Error("Not found");
        res.status(404);
        next(err);
    });

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        res.render("error", {
            message: res.statusCode === 404 ? err.message : "a server error occurred ",
            status: res.statusCode
        })
    });

    const port = env.PORT;
    app.listen({ port }, () => console.log(` > Web server ready at port ${port} - ${app.get("env")}`.magenta));
}