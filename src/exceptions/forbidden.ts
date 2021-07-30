import HttpException from "./httpExceptions";


class ForbiddenException extends HttpException {
    constructor(message: string = "Forbidden") {
        super(403, message);
    }
}

export default ForbiddenException;