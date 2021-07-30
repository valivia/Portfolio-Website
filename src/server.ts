import 'reflect-metadata';

require('dotenv').config();
require("colors").enable();

import validateEnv from './util/ValidateENV'; validateEnv();

import App from './app';
import FileServerController from './routes/file-server/file-server.controller';
import IndexController from './routes/index/index.controller';
import { Container } from 'typedi';
import BrowseController from './routes/browse/browse.controller';
import ProjectController from './routes/project/project.controller';
import ContactController from './routes/contact/contact.controller';

const controllers = [
    Container.get(IndexController),
    Container.get(FileServerController),
    Container.get(BrowseController),
    Container.get(ProjectController),
    Container.get(ContactController)
];

const app = new App(controllers);
app.listen();
