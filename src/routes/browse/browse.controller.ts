import { Router, Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import Controller from "../../interfaces/controller.interface";
import PrismaRepository from "../../repositories/prisma.repository";

@Service()
class BrowseController implements Controller {
    public path = "/browse";
    public router = Router();
    public db;

    constructor(private prismaRepo: PrismaRepository) {
        this.renderBrowse = this.renderBrowse.bind(this);
        this.db = this.prismaRepo.db;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.renderBrowse);
        this.router.post(this.path, this.searchProjects);
    }

    private async renderBrowse(_req: Request, res: Response, _next: NextFunction) {
        const content = await this.db.project.findMany({
            include: { TagLink: { include: { Tags: { include: { Categories: true } } } } },
        });

        res.render("browse", { content });
    }

    private searchProjects(_req: Request, _res: Response, _next: NextFunction) {
        // let query = req.params.query;
    }
}

export default BrowseController;
