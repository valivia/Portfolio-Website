import { IsNumberString } from "class-validator";

class ProjectDeleteDto {

    @IsNumberString()
    public ID: string
}

export default ProjectDeleteDto;