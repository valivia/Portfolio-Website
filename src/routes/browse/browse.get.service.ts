import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Service } from "typedi";

@Service()
class BrowseGetService {
    public async browseGet(_req: Request, res: Response, db: PrismaClient): Promise<void> {

        let content = await db.assets.findMany({ where: { Display: true }, include: { Project: true } });

        content = content.map((asset) => {
            const description = asset.Project.Description;
            if (description && description?.length > 127) {
                asset.Project.Description = `${description?.substring(0, 127)}...`;
            }

            if (asset.Description && asset.Description?.length > 128) {
                asset.Description = `${asset.Description?.substring(0, 127)}...`;
            }

            return asset;
        });

        res.render("browse", { content });

    }
}

export default BrowseGetService;