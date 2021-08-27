import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Service } from "typedi";
import NotFoundException from "../../exceptions/notFound";

@Service()
class GetProjectService {
    public async getproject(req: Request, res: Response, db: PrismaClient): Promise<void> {
        const id = parseInt(req.params.id);

        if (isNaN(id)) throw new NotFoundException();

        const project = await db.project.findFirst({
            where: { ID: id },
            include: {
                Assets: true,
                TagLink: { include: { Tags: { include: { Categories: true } } } },
            },
        });

        if (project === null) throw new NotFoundException();


        console.log(project);
        res.render("project", {
            project,
            content: project?.Assets,
            banner: project.Assets.find(asset => asset.Thumbnail === true),
            tags: project?.TagLink.map(r => r.Tags),
        });
    }
}

export default GetProjectService;