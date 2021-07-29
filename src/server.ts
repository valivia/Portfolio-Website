import 'reflect-metadata';

require('dotenv').config();
import validateEnv from './util/ValidateENV'; validateEnv();

import colors from "colors";
colors.enable();

import App from './app';
import FileServerController from './routes/file-server/file-server.controller';
import IndexController from './routes/index/index.controller';
import { Container } from 'typedi';

const controllers = [
    Container.get(IndexController),
    Container.get(FileServerController)
];

const app = new App(controllers);
app.listen();
