import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Service } from "typedi";
import fs from "fs";
import path from "path";
import NotFoundException from "../../exceptions/notFound";

const dir = path.join(process.cwd(), "assets", "content");

@Service()
class DeleteProjectService {
    public async deleteproject(req: Request, res: Response, db: PrismaClient): Promise<void> {
        const ID = Number(req.body.ID);

        const assets = await db.assets.findMany({ where: { ProjectID: ID } });

        if (assets.length < 1) throw new NotFoundException();

        const deleteTags = db.tagLink.deleteMany({ where: { ProjectID: ID } });
        const deleteAssets = db.assets.deleteMany({ where: { ProjectID: ID } });
        const deleteProject = db.project.delete({ where: { ID: ID } });

        await db.$transaction([deleteAssets, deleteTags, deleteProject]);

        assets.forEach((asset) => {

            Promise.all(["Default", "High", "MediumHigh", "Medium", "Low"]
                .map(size => fs.promises.unlink(path.join(dir, `${asset.FileName}_${size}.jpg`))));
        });

        res.redirect("/project/new");
    }
}

export default DeleteProjectService;