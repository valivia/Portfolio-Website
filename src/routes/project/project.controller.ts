import { Router, Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import Controller from "../../interfaces/controller.interface";
import PrismaRepository from '../../repositories/prisma.repository';

@Service()
class ProjectController implements Controller {
    public path = '/project/:id';
    public router = Router();
    public db;

    constructor(private prismaRepo: PrismaRepository) {
        this.getProject = this.getProject.bind(this);
        this.deleteProject = this.deleteProject.bind(this)

        this.db = this.prismaRepo.db;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.getProject)
        this.router.delete(`${this.path}`, this.deleteProject)
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

    private deleteProject(req: Request, res: Response, _next: NextFunction) {

    }
}

export default ProjectController;
