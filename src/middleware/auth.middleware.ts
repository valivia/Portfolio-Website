import { NextFunction, Request, Response } from "express";
import NotFoundException from "../exceptions/notFound";


function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
    if (req.ip === "192.168.1.100" || req.ip === "::ffff:127.0.0.1") next();
    else next(new NotFoundException());
}

export default authMiddleware;