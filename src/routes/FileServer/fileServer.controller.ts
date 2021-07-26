import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from "fs";
import Controller from "../../interfaces/controller.interface";

const dir = path.join(process.cwd(), "assets");

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

class fileServerController implements Controller {
    public path = "/file/:folder/:fileName";
    public router = Router();

    constructor() {
        this.intilializeRoutes();
    }

    private intilializeRoutes() {
        this.router.get(this.path, this.fileServer)
    }

    private fileServer(req: Request, res: Response, next: NextFunction) {
        try {
            let folder;
            switch (req.params.folder) {
                case "s": folder = "server"; break;
                case "a": folder = "content"; break;
                default: return next();
            }

            // Get file dir.
            let file = path.join(dir, folder, req.params.fileName)

            // Check if big bad.
            if (file.indexOf(dir + path.sep) !== 0) {
                const err = new Error("Forbidden");
                res.status(403);
                return next(err);
            }
            // Get mime type.
            let type = mime[path.extname(file).slice(1)] || 'text/plain';
            // Read file from folder.
            let s = fs.createReadStream(file);
            // If opens.
            s.on('open', function () {
                try {
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
                        s
                        let stream = fs.createReadStream(file, { start, end });
                        return stream.pipe(res);
                    }
                    res.set('Content-Type', type);
                    // Stream file.
                    return s.pipe(res);
                } catch (e) {
                    console.log(e);
                    next(e);

                    return;
                }
            });
            // If fails.
            s.on('error', function () {
                next();
            });
            return;
        } catch (e) {
            console.log(e);
            next(e);

            return;
        }
    }
}

export default fileServerController;