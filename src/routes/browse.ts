import { PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";

export default function (db: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.query.cat !== undefined) {
                await db.categories.create({ data: { Name: req.query.cat as string } })
            }
            if (req.query.tag !== undefined) {
                await db.tags.create({ data: { Name: req.query.tag as string } })
            }

            let content = await db.project.findMany({
                include: {
                    TagLink: { include: { Tags: { include: { Categories: true } } } }
                }
            });

            res.render("browse", {
                content
            });

            return;
        } catch (e) {
            console.log(e);
            res.status(500);
            next(e);
        }
    };
}