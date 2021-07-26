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
import browse from "./routes/browse";
import contact from "./routes/contact";
import upload from "./routes/upload";
import project from "./routes/project"

import headers from "./middleware/Headers"

import newProject from "./posts/newProject";
import contactPost from "./posts/contact"

import { PrismaClient } from ".prisma/client";
import { Client } from "discord.js";

export default function webServer(db: PrismaClient, bot: Client) {

    const app = express();
    const mult = multer();

    app.use(helmet({
        /*contentSecurityPolicy: {
            directives: {
                baseUri: ["'self'"],
                defaultSrc: ["'none'"],
                fontSrc: ["'self'"],
                formAction: ["'none'"],
                frameAncestors: ["'none'"],
                imgSrc: ["'self'",],
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
        reportOnly: (_req: Request) => env.NODE_ENV === "development"
    }));

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

    app.use(headers());

    // static files.
    app.use(express.static(path.join(__dirname, "public")));

    // CSP
    app.post("/report-violation", (_req, res) => {
        console.error("CONTENT SECURITY POLICY VIOLATION".red);
        res.sendStatus(200);
    });

    // get
    app.get("/file/:folder/:fileName", fileServer());
    app.get("/project/:project", project(db));
    app.get("/contact", contact());
    app.get("/browse", browse(db));
    app.get("/upload", upload(db));
    //app.get("/test", async () => { await (await bot.users.fetch("140762569056059392")).send("aaaaaa") });
    app.get("/", index(db));


    // post
    app.post("/upload", mult.single('banner'), newProject(db));
    app.post("/contact", contactPost());
    app.post("project", () => { })

    // put
    app.put("project", () => { })

    // delete
    app.delete("project", () => { });



    // catch 404 and forward to error handler
    app.use((_req, res, next) => {
        const err = new Error("Not found");
        res.status(404);
        next(err);
    });

    // Error handler.
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        res.render("error", {
            message: res.statusCode === 404 ? err.message : "a server error occurred ",
            status: res.statusCode === undefined ? 500 : res.statusCode
        })
    });

    const port = env.PORT;
    app.listen({ port }, () => console.log(` > Web server ready at port ${port} - ${app.get("env")}`.magenta));
}