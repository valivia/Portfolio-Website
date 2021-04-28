import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path"
const dir = path.join(process.cwd(), "assets", "server");

type MimeTypeMap = {
    [x: string]: string
}

let mime: MimeTypeMap = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    js: 'application/javascript',
    wav: 'audio/wav',
    mp3: 'audio/mpeg'
};

export default function fileServer() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get file dir.
            let file = path.join(dir, req.params.fileName)
            // Check if zhin
            if (file.indexOf(dir + path.sep) !== 0) {
                const err = new Error("Forbidden");
                err.status = 403;
                return next(err);
            }
            // Get mime type.
            let type = mime[path.extname(file).slice(1)] || 'text/plain';
            // Read file from folder.
            let s = fs.createReadStream(file);
            // If opens.
            s.on('open', function () {
                if (type == "video/mp4" || type == "audio/mpeg") {
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
                    let stream = fs.createReadStream(file, { start, end });
                    return stream.pipe(res);
                }
                res.set('Content-Type', type);
                // Stream file.
                return s.pipe(res);
            });
            // If fails.
            s.on('error', function () {
                const err = new Error("not found");
                err.status = 404;
                next(err);
            });
            return;
        } catch (e) {
            console.log(e);
            next(e);

            return;
        }
    };
}