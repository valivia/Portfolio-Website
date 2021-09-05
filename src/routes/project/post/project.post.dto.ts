import { Length, IsString, IsNumberString } from "class-validator";

class ProjectPostDto {
    @Length(2, 32)
    public Name: string;

    @Length(0, 1024)
    public Description: string;

    @Length(0, 128)
    public Alt: string;

    @IsNumberString({}, { each: true })
    public Tags: number[];

    @IsString()
    public Status: string;
}

export default ProjectPostDto;