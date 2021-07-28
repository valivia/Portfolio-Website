import 'dotenv/config';
import App from './app';
import FileServerController from './routes/file-server/file-server.controller';
import indexController from './routes/index/index.controller';
import validateEnv from './util/ValidateENV';

validateEnv();

const app = new App(
    [
        new FileServerController(),
        new indexController()
    ],
);

app.listen();