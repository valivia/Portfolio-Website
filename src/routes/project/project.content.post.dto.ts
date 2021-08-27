import { Length, IsNumberString } from "class-validator";

class ProjectContentPostDto {

    public Display: string | undefined;

    @IsNumberString({ no_symbols: true })
    public ID: string

    @Length(0, 256)
    public Description: string;
}

export default ProjectContentPostDto;