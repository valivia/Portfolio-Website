import HttpException from "./httpExceptions";


class NotFoundException extends HttpException {
    constructor(message: string = 'Not Found') {
        super(404, message);
    }
}

export default NotFoundException;