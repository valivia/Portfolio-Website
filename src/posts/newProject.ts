import { Content_Status, PrismaClient } from "@prisma/client";
import { NextFunction, Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";

export default function (db: PrismaClient) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const val = validate(req, res);
            if (val === undefined) return;
            const { name, description, category, tag } = val

            const fileName = uuidv4();

            await db.content.create({
                data: {
                    Name: name,
                    FileName: fileName,
                    Description: description,
                    Status: Content_Status.Unknown,
                    TagID: tag,
                    CategoryID: category,
                }
            });

            if (!await makeAssets(req.file.buffer, fileName)) {
                res.status(500);
                next();
                return;
            }

            res.send("pee").status(200);
        } catch (e) {
            console.log(e);
            next(e);
        }
    };
}

function validate(req: Request, res: Response) {
    let name = req.body.name;
    let description = req.body.description;
    let category = req.body.category;
    let tag = req.body.tag;

    name.trim();
    description.trim();
    name = name.substring(0, 32);
    description = description.substring(0, 256);
    console.log(name.length)

    if (name == undefined || name.length <= 5) {
        res.send("Invalid name").status(400);
        return;
    }

    category = parseInt(category);
    tag = parseInt(tag);

    if (!Number.isFinite(category) || !Number.isFinite(tag)) {
        res.send("Invalid tag or category.").status(400);
        return;
    }

    if (req.file === undefined || req.file.buffer === undefined) {
        res.send("No image attached").status(400);
        return;
    }

    return { name, category, description, tag };
}

async function makeAssets(buffer: Buffer, fileName: string): Promise<boolean> {
    try {
        fs.createWriteStream(`./assets/${fileName}_Default.jpg`).write(buffer);
        fs.createWriteStream(`./assets/${fileName}_High.jpg`).write(await resizeImage(buffer, 0.90));
        fs.createWriteStream(`./assets/${fileName}_MediumHigh.jpg`).write(await resizeImage(buffer, 0.75));
        fs.createWriteStream(`./assets/${fileName}_Medium.jpg`).write(await resizeImage(buffer, 0.50));
        fs.createWriteStream(`./assets/${fileName}_Low.jpg`).write(await resizeImage(buffer, 0.25));

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
        const output = await sharp(input)
            .metadata()
            .then(({ width, height }) => sharp(input)
                .resize(Math.round(width as number * scale), Math.round(height as number * scale))
                .toFormat('jpeg')
                .toBuffer()
            )
        return output;
    } catch (err) {
        throw {
            err,
            message: "Failed to resize the assets",
            type: "RESIZE_ERROR"
        }
    }
}