import HttpException from "./httpExceptions";


class NotFoundException extends HttpException {
    constructor() {
        super(404, `Not Found`);
    }
}

export default NotFoundException;