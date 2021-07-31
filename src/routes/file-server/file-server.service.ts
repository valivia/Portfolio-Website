import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

import { Service } from "typedi";
import NotFoundException from "../../exceptions/notFound";
import ForbiddenException from "../../exceptions/forbidden";

const dir = path.join(process.cwd(), "assets");

type MimeTypeMap = {
    [x: string]: string
}

const mime: MimeTypeMap = {
    html: "text/html",
    txt: "text/plain",
    css: "text/css",
    gif: "image/gif",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    js: "application/javascript",
    wav: "audio/wav",
    mp3: "audio/mpeg",
};

@Service()
class FileServerService {
    private validateFilePath(folderName: string, fileName: string): string {
        // validate that request folder is supported
        let folder: string;
        switch (folderName) {
            case "s": folder = "server"; break;
            case "a": folder = "content"; break;
            default: throw new NotFoundException();
        }

        // path to file
        const file = path.join(dir, folder, fileName);

        // Check if big bad. (user doesnt access files outside of [dir])
        if (file.indexOf(dir + path.sep) !== 0) {
            throw new ForbiddenException;
        }

        // check if file exists
        if (!fs.existsSync(file)) {
            throw new NotFoundException(`File Not Found: ${fileName}`);
        }

        // all good mang
        return file;
    }

    public fileServer(folder: string, fileName: string, req: Request, res: Response, next: NextFunction): void {
        const file: string = this.validateFilePath(folder, fileName);

        // Get mime type.
        const type: string = mime[path.extname(file).slice(1)] || "text/plain";

        let stream: fs.ReadStream;
        if (type == "video/mp4" || type == "audio/mpeg") { // is partial content 206
            const range = req.headers.range !== undefined ? req.headers.range : "0";
            const videoSize = fs.statSync(file).size;
            const CHUNK_SIZE = 10 ** 6; // 1MB
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": end - start + 1,
                "Content-Type": type,
            };
            res.writeHead(206, headers);
            stream = fs.createReadStream(file, { start, end });
        } else {
            res.set("Content-Type", type);
            stream = fs.createReadStream(file);
        }
        stream.pipe(res);

        // If fails.
        stream.on("error", (e) => {
            console.error(e);
            next(undefined);
        });
    }
}

export default FileServerService;
