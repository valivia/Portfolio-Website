import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export default function index(db: PrismaClient) {
    return async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const category = await db.categories.findMany();
            const tags = await db.tags.findMany();
            res.render("upload", { category, tags });
            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}