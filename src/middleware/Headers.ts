import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
dotenv.config();

export default function () {
    return async (req: Request, res: Response, next: NextFunction) => {
        const period = 60 * 60 * 24 * 7

        if (req.method == 'GET') {
            res.set('Cache-control', `public, max-age=${period}`)
        } else {
            res.set('Cache-control', `no-store`)
        }

        next()
    }
}