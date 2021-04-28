import { NextFunction, Request, Response } from "express";
import { Database } from "sqlite";

export default function index(_db: Database) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // console.log(`ip: ${req.ip}`)
            res.render("coding", {});
            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}