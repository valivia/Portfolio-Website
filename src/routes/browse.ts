import { PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";

export default function (db: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(`ip: ${req.ip}`)
            if (req.query.cat !== undefined) {
                await db.categories.create({ data: { CategoryName: req.query.cat } })
            }
            if (req.query.tag !== undefined) {
                await db.tags.create({ data: { TagName: req.query.tag } })
            }

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