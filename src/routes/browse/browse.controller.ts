import { Router, Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import Controller from "../../interfaces/controller.interface";
import PrismaRepository from "../../repositories/prisma.repository";
import BrowseGetService from "./browse.get.service";

@Service()
class BrowseController implements Controller {
    public path = "/browse";
    public router = Router();
    public db;

    constructor(private prismaRepo: PrismaRepository, private browseGetService: BrowseGetService) {
        this.renderBrowse = this.renderBrowse.bind(this);
        this.db = this.prismaRepo.db;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.renderBrowse);
        this.router.post(this.path, this.searchProjects);
    }

    private async renderBrowse(req: Request, res: Response, next: NextFunction) {
        try {
            this.browseGetService.browseGet(req, res, this.db);
        } catch (e) {
            next(e);
        }
    }

    private searchProjects(_req: Request, _res: Response, _next: NextFunction) {
        // let query = req.params.query;
    }
}

export default BrowseController;
