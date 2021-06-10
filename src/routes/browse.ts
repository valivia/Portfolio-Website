import { PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";

export default function index(db: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let posts = await db.content.findMany({ include: { Tags: true, Categories: true, SubContent: true } });

            console.log(posts);

            res.render("browse", {
                posts
            });

            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}