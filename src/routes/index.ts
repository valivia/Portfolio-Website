import { NextFunction, Request, Response } from "express";

export default function index() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(`ip: ${req.ip}`)
            res.render("index", {});
            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}