import { IsEnum, IsNotEmpty, IsNumber, Min } from "class-validator"
import { TransactionTypes } from "../transaction.entity";
import { Transform } from "class-transformer";


export class CreateTransactionDto {
    
    
    
    @Transform((t) => +t.value)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Informe um valor monetário válido' })
    @Min(0.01, {
        message: "A transação deve ser de no mínimo 1 centavo (0.01)"
    })
    @IsNotEmpty({ message: "O valor da transação é obrigatório" })
    amount: string; 
    
    @IsEnum(TransactionTypes, { message: "Escolha um tipo de transação válido" })
    @IsNotEmpty({ message: "O tipo de transação é obrigatória" })
    type: TransactionTypes
}