import 'dotenv/config';
import App from './app';
import fileServerController from './routes/FileServer/fileServer.controller';
import indexController from './routes/index/index.controller';
import validateEnv from './util/ValidateENV';

validateEnv();

const app = new App(
    [
        new fileServerController(),
        new indexController()
    ],
);

app.listen();