import colors from "colors";
colors.enable();

import cookieParser from "cookie-parser";
import express, { Errback, NextFunction, Request, Response } from "express";
import handlebars from "express-handlebars";
import helmet from "helmet";
import logger from "morgan";
import sass from "node-sass-middleware";
import path from "path";
import favicon from "serve-favicon";
import env from "dotenv";
env.config();

import fileServer from "./routes/fileserver";
import index from "./routes/index";
import artwork from "./routes/artwork";
import browse from "./routes/browse"
import { PrismaClient } from ".prisma/client";

export default function webServer(db: PrismaClient) {

    const app = express();

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
        // reportOnly: (req) => req.app.get("env") === "development"
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
    app.use(cookieParser(process.env.COOKIETOKEN));
    app.set("trust proxy", true);
    app.set("env", "production");
    app.use(sass({
        debug: false,
        dest: path.join(__dirname, "/public"),
        force: true,
        indentedSyntax: false,
        outputStyle: "compressed",
        src: __dirname
    }));

    // default headers.
    app.use((_req, _res, next) => {
        next();
    });

    // static files.
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.static("./assets/artwork"));

    // CSP
    app.post("/report-violation", (_req, res) => {
        console.error("CONTENT SECURITY POLICY VIOLATION".red);
        res.sendStatus(200);
    });

    // GET ROUTES
    app.get("/file/:fileName", fileServer());
    app.get("/artwork", artwork());
    app.get("/browse", browse(db));
    app.get("/", index());


    // catch 404 and forward to error handler
    app.use((_req, _res, next) => {
        const err = new Error("not found");
        err.status = 404;
        next(err);
    });

    // Handle bad CSRF token
    app.use((err: Errback, _req: Request, res: Response, next: NextFunction) => {
        if (err.code !== "EBADCSRFTOKEN") {
            next(err);
            return;
        }
        res.status(503);
        res.json({
            error: "form tampered with"
        });
    });

    // development error handler
    // will print stacktrace
    if (process.env.NODE_ENV != "production") {
        app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
            if (err.status !== 404) { console.log(err); }
            res.status(err.status || 500);
            res.render("error", {
                Message: err.message,
                Status: err.status
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status === undefined ? 500 : err.status as number;
        if (status !== 404) { console.log(err); }
        res.status(status);
        res.render("error", {
            Message: status === 404 ? err.message : "a server error occurred ",
            Status: status
        });
    });

    const port = process.env.PORT;
    app.listen({ port }, () => console.log(` > Web server ready at port ${port} - ${app.get("env")}`.magenta));
}