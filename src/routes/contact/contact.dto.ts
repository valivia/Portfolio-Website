import { IsEmail, Length } from "class-validator";

class ContactDto {

    @Length(2, 32)
    public firstName: string;

    @Length(2, 32)
    public lastName: string;

    @IsEmail()
    public email: string;

    @Length(3, 24)
    public subject: string;

    @Length(16, 512)
    public message: string;
}

export default ContactDto;