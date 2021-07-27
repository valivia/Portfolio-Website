import { Router, Request, Response, NextFunction } from 'express';
import Controller from "../../interfaces/controller.interface";

class browseController implements Controller {
    public path = '/browse';
    public router = Router();

    constructor() {
        this.intilializeRoutes();
    }

    private intilializeRoutes() {
        this.router.get(this.path, this.renderBrowse)
        this.router.post(this.path, this.searchProjects)
    }

    private renderBrowse(_req: Request, res: Response, _next: NextFunction) {
        const content = db.project.findMany({
            include: { TagLink: { include: { Tags: { include: { Categories: true } } } } }
        });

        res.render("browse", content);
    }

    private searchProjects(req: Request, res: Response, _next: NextFunction) {
        let query = req.params.query;
    }
}

export default browseController;