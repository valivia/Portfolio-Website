import { PrismaClient } from ".prisma/client";
import { NextFunction, Request, Response } from "express";

export default function (db: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.project);

            if (!Number.isFinite(id)) {
                next();
                return;
            }

            let content = await db.project.findFirst({
                where: {
                    ID: id,
                },
                include: {
                    SubContent: true,
                    TagLink: { include: { Tags: { include: { Categories: true } } } }
                }
            });

            res.render("project", {
                content: content,
                subcontent: content?.SubContent,
                tags: content?.TagLink.map(r => r.Tags),
            })
            return;
        } catch (e) {
            console.log(e);
            res.status(500);
            next(e);
        }
    };
}