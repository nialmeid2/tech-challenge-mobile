import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";


export class RegisterDto {

    @IsNotEmpty({ message: "O E-mail é obrigatório" })
    @IsEmail({ }, { message: "O E-mail deve estar em um formato válido" })
    email: string;

    @IsNotEmpty({message: "A senha é obrigatória"})
    @IsStrongPassword({ minLength: 8, minNumbers: 1, minLowercase: 1, minSymbols: 1, minUppercase: 1 }, 
        { message: "A senha deve conter pelo menos 8 caracteres, sendo pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial"  })
    password: string;

    @IsNotEmpty({ message: "O nome é obrigatório" })    
    name: string;

}