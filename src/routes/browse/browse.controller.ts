import { PrismaClient } from '@prisma/client';
import { Router, Request, Response, NextFunction } from 'express';
import { Inject, Service } from 'typedi';
import Controller from "../../interfaces/controller.interface";

@Service()
class BrowseController implements Controller {
    public path = '/browse';
    public router = Router();

    constructor(@Inject('prisma.client') private db: PrismaClient) {
        this.db = db;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.renderBrowse)
        this.router.post(this.path, this.searchProjects)
    }

    private renderBrowse(_req: Request, res: Response, _next: NextFunction) {
        const content = this.db.project.findMany({
            include: { TagLink: { include: { Tags: { include: { Categories: true } } } } }
        });

        res.render("browse", content);
    }

    private searchProjects(_req: Request, _res: Response, _next: NextFunction) {
        // let query = req.params.query;
    }
}

export default BrowseController;
