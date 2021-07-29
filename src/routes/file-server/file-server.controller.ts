import { Router, Request, Response, NextFunction } from 'express';
import Controller from "../../interfaces/controller.interface";

import { Service } from 'typedi';
import FileServerService from './file-server.service';

@Service()
class FileServerController implements Controller {
    public path = "/file/:folder/:fileName";
    public router = Router();

    constructor(private fileServerService: FileServerService) {
        this.fileServer = this.fileServer.bind(this); // because of bad js binding
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.fileServer)
    }

    async fileServer(req: Request, res: Response, next: NextFunction) {
        try {
            this.fileServerService.fileServer(req.params.folder, req.params.fileName, req, res, next);
        } catch (e) {
            console.error(e);
            next(e);
        }
    }
}

export default FileServerController;
