import { NextFunction, Request, Response } from "express";
import fs from "fs";

export default function artwork() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(`ip: ${req.ip}`)
            await fs.readdir('./assets/artwork', (err, files) => {
                res.render("artwork", {
                    pictures: files
                });
            });
            return;
        } catch (e) {
            console.log(e);
            next(e);
        }
    }
};