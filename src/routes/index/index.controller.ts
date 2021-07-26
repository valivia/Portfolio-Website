import { Router, Request, Response, NextFunction } from 'express';
import Controller from "../../interfaces/controller.interface";

class indexController implements Controller {
    public path = '/';
    public router = Router();

    constructor() {
        this.intilializeRoutes();
    }

    private intilializeRoutes() {
        this.router.get(this.path, this.renderIndex)
    }

    private renderIndex(_req: Request, res: Response, _next: NextFunction) {
        res.render("index");
    }
}

export default indexController;