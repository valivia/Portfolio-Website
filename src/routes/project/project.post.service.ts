import ServerErrorException from "../../exceptions/serverError";
import { Assets_Type, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Service } from "typedi";
import HttpException from "../../exceptions/httpExceptions";
import env from "dotenv";
import ImageService from "../../util/Image.service";
env.config();

@Service()
class PostProjectService {
    public async postProject(req: Request, res: Response, db: PrismaClient): Promise<void> {
        const { Name, Description, Status } = req.body;
        let { Tags } = req.body;

        console.log(`${Name} ${Description} ${Tags}`);

        if (!req?.file?.buffer) throw new HttpException(400, "No image attached.");


        if (typeof Tags == "string") { Tags = [Tags]; }

        const tagArray: ITags[] = [];
        Tags.forEach((tag: number | string) => {
            tag = parseInt(tag as string);
            if (!Number.isFinite(tag)) {
                res.send("Invalid tags.").status(400);
                return;
            }
            tagArray.push({ TagID: tag });
        });

        const fileName = uuidv4();

        const project = await db.project.create({
            data: {
                Name,
                Description,
                Status: Status,
                TagLink: {
                    createMany: {
                        data: tagArray,
                    },
                },
                Assets: {
                    create: {
                        FileName: fileName,
                        Type: Assets_Type.Image,
                        Display: true,
                        Thumbnail: true,
                        Description: null,

                    },
                },
            },
            include: { TagLink: true },
        });

        const imageProcessing = new ImageService(req.file.buffer);
        if (!await imageProcessing.makeAssets(fileName)) {
            throw new ServerErrorException();
        }

        res.status(200).redirect(`/project/${project.ID}`);
    }
}

export default PostProjectService;

interface ITags {
    TagID: number;
}