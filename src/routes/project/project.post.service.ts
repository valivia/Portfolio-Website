import ServerErrorException from "../../exceptions/serverError";
import { PrismaClient, Project_Status } from "@prisma/client";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Service } from "typedi";
import sharp from "sharp";
import fs from "fs";
import HttpException from "../../exceptions/httpExceptions";
import env from "dotenv";
env.config();

@Service()
class PostProjectService {
    public async postProject(req: Request, res: Response, db: PrismaClient): Promise<void> {
        let { Name, Description, Tags } = req.body;

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
                FileName: fileName,
                Description,
                Status: Project_Status.unknown,
                TagLink: {
                    createMany: {
                        data: tagArray,
                    },
                },
            },
            include: { TagLink: true },
        });

        if (!await this.makeAssets(req.file.buffer, fileName)) {
            throw new ServerErrorException();
        }

        res.status(200).redirect(`/project/${project.ID}`);
    }

    public async makeAssets(buffer: Buffer, fileName: string): Promise<boolean> {
        try {
            fs.createWriteStream(`./assets/content/${fileName}_Default.jpg`).write(await this.resizeImage(buffer, 1));
            fs.createWriteStream(`./assets/content/${fileName}_High.jpg`).write(await this.resizeImage(buffer, 0.75));
            fs.createWriteStream(`./assets/content/${fileName}_MediumHigh.jpg`).write(await this.resizeImage(buffer, 0.6667));
            fs.createWriteStream(`./assets/content/${fileName}_Medium.jpg`).write(await this.resizeImage(buffer, 0.5));
            fs.createWriteStream(`./assets/content/${fileName}_Low.jpg`).write(await this.resizeImage(buffer, 0.28125));

            return true;
        } catch (err) {
            throw {
                err,
                message: `Failed to save the resized assets.`,
                type: `WRITE_ERROR`,
            };
        }
    }

    public async resizeImage(input: Buffer, scale: number): Promise<Buffer> {
        if (scale < 0.1 || scale > 1) throw { message: `Wrong scale size ${scale}`, type: `RESIZE_ERROR` };
        try {

            const baseImage = sharp(input);
            const metadata = await baseImage.metadata();

            const width = Math.round(metadata.width as number * scale);
            const height = Math.round(metadata.height as number * scale);

            console.log(`${width} x ${height}`);

            const output = await sharp(input)
                .withMetadata({ exif: { IFD0: { Copyright: process.env.AUTHOR } } })
                .resize(width, height)
                .toFormat("jpg")
                .toBuffer();

            return output;
        } catch (err) {
            throw {
                err,
                message: "Failed to resize the assets",
                type: "RESIZE_ERROR",
            };
        }
    }
}

export default PostProjectService;

interface ITags {
    TagID: number;
}