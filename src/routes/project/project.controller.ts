import { Router, Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import Controller from "../../interfaces/controller.interface";
import validationMiddleware from '../../middleware/validation.middleware';
import PrismaRepository from '../../repositories/prisma.repository';
import ProjectPostDto from './project.post.dto';
import PostProjectService from './project.post.service';
const mult = require("multer")();

@Service()
class ProjectController implements Controller {
    public path = '/project';
    public router = Router();
    public db;

    constructor(
        private prismaRepo: PrismaRepository,
        private PostProjectService: PostProjectService
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
        this.router.get(`${this.path}/new`, this.getUpload)
        this.router.get(`${this.path}/:id`, this.getProject)
        this.router.post(this.path, mult.single("Banner"), validationMiddleware(ProjectPostDto), this.postProject)
        this.router.delete(this.path, this.deleteProject)
    }

    private async getProject(req: Request, res: Response, _next: NextFunction) {
        const id = parseInt(req.params.id);
        let content = await this.db.project.findFirst({
            where: { ID: id, },
            include: {
                SubContent: true,
                TagLink: { include: { Tags: { include: { Categories: true } } } }
            }
        });

        res.render("project", {
            content: content,
            subcontent: content?.SubContent,
            tags: content?.TagLink.map(r => r.Tags),
        });
    }

    private postProject(req: Request, res: Response, next: NextFunction) {
        this.PostProjectService.postProject(req, res, this.db)
            .catch((e) => { next(e) });
    }

    private deleteProject(req: Request, res: Response, _next: NextFunction) {

    }

    private async getUpload(_req: Request, res: Response, _next: NextFunction) {
        const category = await this.db.categories.findMany();
        const tags = await this.db.tags.findMany();
        res.render("upload", { category, tags });
    }

}

export default ProjectController;
