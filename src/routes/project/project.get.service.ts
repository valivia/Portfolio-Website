import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Service } from "typedi";

@Service()
class GetProjectService {
    public async getproject(req: Request, res: Response, db: PrismaClient) {
        const id = parseInt(req.params.id);
        let content = await db.project.findFirst({
            where: { ID: id, },
            include: {
                SubContent: true,
                TagLink: { include: { Tags: { include: { Categories: true } } } }
            }
        });

        res.render("project", {
            content: content,
            subcontent: content?.SubContent,
            tags: content?.TagLink.map(r => r.Tags),
        });
    }
}

export default GetProjectService