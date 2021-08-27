import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Service } from "typedi";

@Service()
class BrowseGetService {
    public async browseGet(_req: Request, res: Response, db: PrismaClient): Promise<void> {

        const query: Prisma.AssetsFindManyArgs = { where: { Display: true }, include: { Project: true } };


        const content = await db.assets.findMany(query);

        res.render("browse", { content });

    }
}

export default BrowseGetService;