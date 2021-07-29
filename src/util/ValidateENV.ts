// import { cleanEnv, email, host, num, port, str, url } from 'envalid';
import { cleanEnv, num, port, str } from 'envalid';

function validateEnv() {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ['development', 'test', 'production'] }),

        // web
        PORT: port(),
        COOKIETOKEN: str(),
        SESSIONLENGTH: num(),

        // db
        // DATABASE_URL: url(),

        // content
        AUTHOR: str(),

        // Email
        // EMAIL_HOST: host(),
        // EMAIL_PORT: num(),
        // EMAIL_USER: str(),
        // EMAIL_PASS: str(),
        // EMAIL_FROM: str(),
        // EMAIL_TARGET: email(),
    });
}

export default validateEnv;