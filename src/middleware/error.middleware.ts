import { NextFunction, Request, Response } from 'express';

function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    res.render("error", { message, status });
}

export default errorMiddleware;