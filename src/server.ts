import "reflect-metadata";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("colors").enable();

import validateEnv from "./util/ValidateENV"; validateEnv();

import App from "./app";
import FileServerController from "./routes/file-server/file-server.controller";
import IndexController from "./routes/index/index.controller";
import { Container } from "typedi";
import BrowseController from "./routes/browse/browse.controller";
import ProjectController from "./routes/project/project.controller";
import ContactController from "./routes/contact/contact.controller";
import aboutController from "./routes/about/about.controller";

const controllers = [
    Container.get(IndexController),
    Container.get(FileServerController),
    Container.get(BrowseController),
    Container.get(ProjectController),
    Container.get(ContactController),
    Container.get(aboutController),
];

const app = new App(controllers);
app.listen();
