import { IsEmail, IsEnum, IsNotEmpty, Min } from "class-validator"
import { TransactionTypes } from "../transaction.entity";


export class CreateTransactionDto {
    
    
    @Min(0.01, {
        message: "A transação deve ser de no mínimo 1 centavo (0.01)"
    })
    @IsNotEmpty({ message: "O valor da transação é obrigatório" })
    amount: number; 
    
    @IsEnum(TransactionTypes, { message: "Escolha um tipo de transação válido" })
    @IsNotEmpty({ message: "O tipo de transação é obrigatória" })
    type: TransactionTypes
}