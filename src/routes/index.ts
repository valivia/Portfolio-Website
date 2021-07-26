import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export default function index(db: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const photography = await db.tags.findUnique({
                where: {
                    TagID: 2
                },
                include: { TagLink: { include: { Project: true } } }
            });

            res.render("index", { photography: photography?.TagLink.map(r => r.Project) });
            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}