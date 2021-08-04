import { Router, Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import Controller from "../../interfaces/controller.interface";
import PrismaRepository from "../../repositories/prisma.repository";

@Service()
class aboutController implements Controller {
    public path = "/about";
    public router = Router();
    public db;

    constructor(private prismaRepo: PrismaRepository) {
        this.db = this.prismaRepo.db;

        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAbout);
    }

    private async getAbout(_req: Request, res: Response, _next: NextFunction) {
        res.render("error", { status: 451, message: "Unavailable For Legal Reasons" });
    }

}

export default aboutController;
