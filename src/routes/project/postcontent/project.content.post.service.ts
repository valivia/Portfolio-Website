import { Assets_Type, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Service } from "typedi";
import env from "dotenv";
import ProjectContentPostDto from "./project.content.post.dto";
import HttpException from "../../../exceptions/httpExceptions";
import ServerErrorException from "../../../exceptions/serverError";
import ImageService from "../../../util/image.service";
env.config();

@Service()
class PostProjectContentService {
    public async postContent(req: Request, res: Response, db: PrismaClient): Promise<void> {

        const { Description, ID, Display } = req.body as ProjectContentPostDto;
        console.log(req.body);

        if (!req?.file?.buffer) throw new HttpException(400, "No image attached.");

        const FileName = uuidv4();

        await db.assets.create({
            data: {
                FileName,
                Description: Description,
                Display: Display ? true : false,
                ProjectID: Number(ID),
                Type: Assets_Type.Image,
            },
        });

        const imageProcessing = new ImageService(req.file.buffer);
        console.log(await imageProcessing.getTheme());
        if (!await imageProcessing.makeAssets(FileName)) {
            throw new ServerErrorException();
        }

        res.redirect(`/project/new`);
    }
}

export default PostProjectContentService;
