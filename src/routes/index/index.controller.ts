import { Router, Request, Response, NextFunction } from "express";
import { Service } from "typedi";
import Controller from "../../interfaces/controller.interface";

@Service()
class IndexController implements Controller {
    public path = "/";
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.renderIndex);
    }

    private renderIndex(_req: Request, res: Response, _next: NextFunction) {
        res.render("index");
    }
}

export default IndexController;