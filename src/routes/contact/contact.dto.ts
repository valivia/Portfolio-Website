import { IsEmail, Length } from "class-validator";

class ContactDto {
    @IsEmail()
    public email: string;

    @Length(3, 24)
    public subject: string;

    @Length(16, 512)
    public message: string;
}

export default ContactDto;