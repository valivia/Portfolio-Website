import { Length, IsNumberString } from "class-validator";

class ProjectContentPostDto {

    public Display: string | undefined;

    @IsNumberString({ no_symbols: true })
    public ID: string

    @Length(0, 1024)
    public Description: string;

    @Length(0, 128)
    public Alt: string;
}

export default ProjectContentPostDto;