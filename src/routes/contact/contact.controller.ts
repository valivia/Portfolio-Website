import { Router, Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import ServerErrorException from "../../exceptions/serverError";
import Controller from "../../interfaces/controller.interface";
import validationMiddleware from "../../middleware/validation.middleware";
import PrismaRepository from "../../repositories/prisma.repository";
import EmailService from "../../util/email.service";
import ContactDto from "./contact.dto";
import ratelimit from "express-rate-limit";

const limit = ratelimit({
    windowMs: 12 * 60 * 60 * 1000, // 12 hours
    max: 2,
    message:
        "Too many emails sent, try again tomorrow",
});

@Service()
class ContactController implements Controller {
    public path = "/contact";
    public router = Router();
    public db;

    constructor(private prismaRepo: PrismaRepository) {
        this.db = this.prismaRepo.db;

        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getContact);
        this.router.post(this.path, validationMiddleware(ContactDto), limit, this.postContact);
    }

    private async getContact(_req: Request, res: Response, _next: NextFunction) {
        res.render("contact");
    }

    private postContact(req: Request, res: Response, next: NextFunction) {
        try {
            const { firstName, lastName, email, subject, message }: ContactDto = req.body;
            const mailService = new EmailService();
            mailService.sendEmail(subject, `message:\n${message}\nsent by:\n${firstName} ${lastName}\n${email}`);

            res.status(200).send("Email sent");
        } catch {
            next(new ServerErrorException());
        }
    }
}

export default ContactController;
