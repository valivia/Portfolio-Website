import { Length, IsString } from "class-validator";

class ProjectPostDto {
    @Length(2, 32)
    public Name: string;

    @Length(0, 256)
    public Description: string;

    @Length(1, 1, { each: true })
    public Tags: number[];

    @IsString()
    public Status: string;
}

export default ProjectPostDto;