import { NextFunction, Request, Response } from "express";

export default function index() {
    return async (_req: Request, res: Response, next: NextFunction) => {
        try {
            // console.log(`ip: ${req.ip}`)
            res.render("music", {});
            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}