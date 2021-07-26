import { NextFunction, Request, Response } from "express";

export default function index() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            res.render("contact");
            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}