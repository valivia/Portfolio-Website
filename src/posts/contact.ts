import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";
import val from "validator";
import dotenv from "dotenv";


dotenv.config();
const env = process.env
export default function index() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { email, subject, content } = req.body
            // Validate
            validate(email, subject, content);
            // Send Email.
            await Email(subject, content);
            // ok.
            res.status(200);
        } catch (e) {
            res.status(e.status).send(e.message)
        }
    }
}

async function Email(subject: string, content: string) {
    let transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: Number(env.EMAIL_PORT),
        secure: true,
        debug: true,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: env.EMAIL_TARGET,
        subject: subject,
        text: content
    });

    console.log("Message sent: %s", info.messageId);

    return;
}

function validate(email: string, subject: string, content: string) {
    if (!email || !subject || !content) throw { status: 400, message: "Not all arguments provided." }
    if (!val.isEmail(email)) throw { status: 400, message: "Invalid email." }
    return { email, subject, content }
}