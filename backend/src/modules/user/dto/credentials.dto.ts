import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";


export class CredentialsDto {

    @IsNotEmpty({ message: "O E-mail é obrigatório" })
    @IsEmail({ }, { message: "O E-mail deve estar em um formato válido" })
    email: string;

    @IsNotEmpty({message: "A senha é obrigatória"})  
    @IsStrongPassword({ minLength: 8, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1}, {
        message: 'A senha deve ter 8 caracteres, tendo uma letra minúsculo, uma maiúscula, um número e 1 caractere especial'
    })  
    password: string;

}