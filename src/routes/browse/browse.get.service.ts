import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Service } from "typedi";

@Service()
class BrowseGetService {
    public async browseGet(req: Request, res: Response, db: PrismaClient): Promise<void> {

        const tag = Number(req.query.tag);
        // const cat = Number(req.query.cat);
        let query: Prisma.ProjectFindManyArgs = { include: { TagLink: { include: { Tags: { include: { Categories: true } } } } } };

        if (tag && !isNaN(tag)) {
            query = { include: { TagLink: { include: { Tags: { include: { Categories: true } } } } }, where: { TagLink: { every: { TagID: tag } } } };
        }
        /*
        if (cat && !isNaN(cat)) {
            query = { include: { TagLink: { include: { Tags: { include: { Categories: true } } } } }, where: { TagLink: { } } } };
        }
        */

        const content = await db.project.findMany(query);

        res.render("browse", { content });

    }
}

export default BrowseGetService;