import { Router, Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import Controller from "../../interfaces/controller.interface";
import validationMiddleware from "../../middleware/validation.middleware";
import PrismaRepository from "../../repositories/prisma.repository";
import ProjectPostDto from "./project.post.dto";
import multer from "multer";
import PostProjectService from "./project.post.service";
import GetProjectService from "./project.get.service";
import authMiddleware from "../../middleware/auth.middleware";
import PostProjectContentService from "./project.content.post.service";
import ProjectContentPostDto from "./project.content.post.dto";
const mult = multer();

@Service()
class ProjectController implements Controller {
    public path = "/project";
    public router = Router();
    public db;

    constructor(
        private prismaRepo: PrismaRepository,
        private getService: GetProjectService,
        private postService: PostProjectService,
        private ContentService: PostProjectContentService,
    ) {
        // Local functions.
        this.get_upload = this.get_upload.bind(this);
        this.get_project = this.get_project.bind(this);
        this.post_project = this.post_project.bind(this);
        this.delete_project = this.delete_project.bind(this);
        this.post_content = this.post_content.bind(this);

        this.db = this.prismaRepo.db;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.delete(this.path, authMiddleware, this.delete_project);
        this.router.get(`${this.path}/new`, authMiddleware, this.get_upload);
        this.router.post(this.path, mult.single("Banner"), authMiddleware, validationMiddleware(ProjectPostDto), this.post_project);
        this.router.post("/content", mult.single("Image"), validationMiddleware(ProjectContentPostDto), this.post_content);


        this.router.get(`${this.path}/:id`, this.get_project);
    }

    private async get_project(req: Request, res: Response, next: NextFunction) {
        this.getService.getproject(req, res, this.db).catch((e: Error) => { next(e); });
    }

    private post_project(req: Request, res: Response, next: NextFunction) {
        this.postService.postProject(req, res, this.db).catch((e: Error) => { next(e); });
    }

    private post_content(req: Request, res: Response, next: NextFunction) {
        this.ContentService.postContent(req, res, this.db).catch((e: Error) => { next(e); });
    }

    private async delete_project(req: Request, res: Response, next: NextFunction) {
        await this.db.project.delete({ where: { ID: req.body } })
            .then(() => res.status(200).send("Project deleted"))
            .catch((e) => next(e));
    }

    private async get_upload(_req: Request, res: Response, _next: NextFunction) {
        const category = await this.db.categories.findMany();
        const projects = await this.db.project.findMany();
        const tags = await this.db.tags.findMany();
        res.render("upload", { category, projects, tags });
    }

}

export default ProjectController;
