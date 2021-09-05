import fs from "fs";
import sharp from "sharp";
import theme from "node-vibrant";
import ServerErrorException from "../exceptions/serverError";

export default class ImageService {
    private buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }
    public async resizeImage(scale: number, square = false): Promise<Buffer> {
        if (scale < 0.1 || scale > 1) throw { message: `Wrong scale size ${scale}`, type: `RESIZE_ERROR` };
        try {

            const baseImage = sharp(this.buffer);
            const metadata = await baseImage.metadata();

            if (!metadata.width || !metadata.height) throw new ServerErrorException();

            if (square) {
                metadata.height = metadata.width = Math.min(metadata.height, metadata.width);
            }

            const width = Math.round(metadata.width as number * scale);
            const height = Math.round(metadata.height as number * scale);

            console.log(`${width} x ${height}`);

            const output = await sharp(this.buffer)
                .withMetadata({ exif: { IFD0: { Copyright: process.env.AUTHOR } } })
                .resize(width, height)
                .jpeg({
                    mozjpeg: true,
                })
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

    public async makeAssets(fileName: string): Promise<boolean> {
        try {
            // Source.
            fs.createWriteStream(`./assets/archive/${fileName}.png`).write(this.buffer);

            // Scaled.
            fs.createWriteStream(`./assets/content/${fileName}_Default.jpg`).write(await this.resizeImage(1));
            fs.createWriteStream(`./assets/content/${fileName}_High.jpg`).write(await this.resizeImage(0.75));
            fs.createWriteStream(`./assets/content/${fileName}_MediumHigh.jpg`).write(await this.resizeImage(0.6667));
            fs.createWriteStream(`./assets/content/${fileName}_Medium.jpg`).write(await this.resizeImage(0.5));
            fs.createWriteStream(`./assets/content/${fileName}_Low.jpg`).write(await this.resizeImage(0.28125));

            // Square.
            fs.createWriteStream(`./assets/content/${fileName}_SDefault.jpg`).write(await this.resizeImage(1, true));
            fs.createWriteStream(`./assets/content/${fileName}_SHigh.jpg`).write(await this.resizeImage(0.75, true));
            fs.createWriteStream(`./assets/content/${fileName}_SMediumHigh.jpg`).write(await this.resizeImage(0.6667, true));
            fs.createWriteStream(`./assets/content/${fileName}_SMedium.jpg`).write(await this.resizeImage(0.5, true));
            fs.createWriteStream(`./assets/content/${fileName}_SLow.jpg`).write(await this.resizeImage(0.28125, true));

            return true;
        } catch (err) {
            throw {
                err,
                message: `Failed to save the resized assets.`,
                type: `WRITE_ERROR`,
            };
        }
    }

    public async getTheme(): Promise<unknown> {
        const colours = await theme.from(this.buffer).getPalette();
        return colours;
    }
}