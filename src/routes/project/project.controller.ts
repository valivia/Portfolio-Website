import { Router, Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import Controller from "../../interfaces/controller.interface";
import validationMiddleware from "../../middleware/validation.middleware";
import PrismaRepository from "../../repositories/prisma.repository";
import ProjectPostDto from "./project.post.dto";
import multer from "multer";
import PostProjectService from "./project.post.service";
import GetProjectService from "./project.get.service";
const mult = multer();

@Service()
class ProjectController implements Controller {
    public path = "/project";
    public router = Router();
    public db;

    constructor(
        private prismaRepo: PrismaRepository,
        private getService: GetProjectService,
        private PostService: PostProjectService,
    ) {
        // Local functions.
        this.getUpload = this.getUpload.bind(this);
        this.getProject = this.getProject.bind(this);
        this.postProject = this.postProject.bind(this);
        this.deleteProject = this.deleteProject.bind(this);

        this.db = this.prismaRepo.db;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/new`, this.getUpload);
        this.router.get(`${this.path}/:id`, this.getProject);
        this.router.post(this.path, mult.single("Banner"), validationMiddleware(ProjectPostDto), this.postProject);
        this.router.delete(this.path, this.deleteProject);
    }

    private async getProject(req: Request, res: Response, next: NextFunction) {
        try {
            this.getService.getproject(req, res, this.db).catch((e: Error) => { next(e); });
        } catch (e) {
            next(e);
        }
    }

    private postProject(req: Request, res: Response, next: NextFunction) {
        this.PostService.postProject(req, res, this.db)
            .catch((e: Error) => { next(e); });
    }

    private deleteProject(_req: Request, _res: Response, _next: NextFunction) {
        return;
    }

    private async getUpload(_req: Request, res: Response, _next: NextFunction) {
        const category = await this.db.categories.findMany();
        const tags = await this.db.tags.findMany();
        res.render("upload", { category, tags });
    }

}

export default ProjectController;
