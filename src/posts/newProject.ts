import { Project_Status, PrismaClient, Project } from "@prisma/client";
import { NextFunction, Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
const env = process.env

export default function (db: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const val = validate(req, res);
            if (val === undefined) return;
            const { name, description, tags } = val

            const fileName = uuidv4();

            const project = await db.project.create({
                data: {
                    Name: name,
                    FileName: fileName,
                    Description: description,
                    Status: Project_Status.unknown,
                    TagLink: {
                        createMany: {
                            data: tags
                        }
                    }
                },
                include: { TagLink: true }
            });


            webhook(project);

            if (!await makeAssets(req.file.buffer, fileName)) {
                res.status(500);
                next();
                return;
            }

            res.status(200).redirect("/upload")
        } catch (e) {
            console.log(e);
            res.status(500);
            next(e);
        }
    };
}

function validate(req: Request, res: Response) {
    try {
        let name = req.body.name;
        let description = req.body.description;
        let inputTags: string[] | string = req.body.tag;

        if (inputTags === undefined) {
            res.send("No tag provided").status(400);
            return;
        }

        if (typeof inputTags == "string") {
            inputTags = [inputTags]
        }

        name.trim();
        description.trim();
        name = name.substring(0, 32);
        description = description.substring(0, 256);

        if (name == undefined || name.length <= 3) {
            res.send("Invalid name").status(400);
            return;
        }

        if (req.file === undefined || req.file.buffer === undefined) {
            res.send("No image attached").status(400);
            return;
        }

        let tags: ITags[] = [];
        inputTags.forEach((tag: number | string) => {
            tag = parseInt(tag as string);
            if (!Number.isFinite(tag)) {
                res.send("Invalid tags.").status(400);
                return;
            }
            tags.push({ TagID: tag })
        });

        return { name, description, tags };
    } catch (err) {
        res.status(500);
        throw {
            err,
            message: `Failed to validate the request.`,
            type: `VALIDATE_ERROR`
        }
    }
}

async function makeAssets(buffer: Buffer, fileName: string): Promise<boolean> {
    try {
        fs.createWriteStream(`./assets/content/${fileName}_Default.jpg`).write(await resizeImage(buffer, 1));
        fs.createWriteStream(`./assets/content/${fileName}_High.jpg`).write(await resizeImage(buffer, 0.90));
        fs.createWriteStream(`./assets/content/${fileName}_MediumHigh.jpg`).write(await resizeImage(buffer, 0.75));
        fs.createWriteStream(`./assets/content/${fileName}_Medium.jpg`).write(await resizeImage(buffer, 0.50));
        fs.createWriteStream(`./assets/content/${fileName}_Low.jpg`).write(await resizeImage(buffer, 0.25));

        return true;
    } catch (err) {
        throw {
            err,
            message: `Failed to save the resized assets.`,
            type: `WRITE_ERROR`
        }
    }
}

async function resizeImage(input: Buffer, scale: number): Promise<Buffer> {
    if (scale < .1 || scale > 1) throw { message: `Wrong scale size ${scale}`, type: `RESIZE_ERROR` }
    try {

        const baseImage = sharp(input);
        const metadata = await baseImage.metadata();

        let width = Math.round(metadata.width as number * scale);
        let height = Math.round(metadata.height as number * scale)

        let output = await sharp(input)
            .withMetadata({
                exif: {
                    IFD0: {
                        Copyright: env.AUTHOR,
                    }
                }
            })
            .resize(width, height)
            .toFormat('jpeg')
            .toBuffer()

        return output;
    } catch (err) {
        throw {
            err,
            message: "Failed to resize the assets",
            type: "RESIZE_ERROR"
        }
    }
}

async function webhook(project: Project) {
    const data = {
        username: "Xayania",
        avatar_url: "https://art.xayania.com/file/s/tbhc_MediumHigh.jpg",
        embeds: [
            {
                "title": "New Post!",
                "thumbnail": {
                    "url": `https://art.xayania.com/file/a/${project.FileName}_MediumHigh.jpg`,
                },
                "fields": [
                    {
                        "name": project.Name,
                        "value": project.Description || "no description provided",
                        "inline": true
                    }
                ]
            }
        ]
    };

    console.log(data);
    console.log(data.embeds[0].thumbnail)
    console.log(data.embeds[0].fields)

    await axios
        .post(env.WEBHOOK!, data)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
        })
        .catch(error => {
            console.error(error)
        })
}
interface ITags {
    TagID: number;
}