
export class TransactionEntity {
    id?: string;
    type: TransactionTypes;
    value: number;
    createdAt: string;
    userId: string;
    file?: string
}

export interface InterceptedFile {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer: Buffer,
    size: number
}

export enum TransactionTypes {
    DEPOSIT = 'Depósito',
    INCOME = "Renda",
    WITHDRAW = 'Saque',
    TRANSFER = 'Transferência',
    INVESTIMENT_FUNDS = 'Investimento em fundos',
    DIRECT_TREASURY = 'Investimento em Tesouro Direto',
    PRIVATE_RETIREMENT = 'Investimento em Previdência Privada',
    STOCKS = 'Investimento em Bolsa de Valores',
    INTEREST = "Rendimentos de Investimentos"
}

export const AdditiveTransactions = [TransactionTypes.DEPOSIT, TransactionTypes.INCOME, TransactionTypes.INTEREST]

export const SubtractiveTransactions = [
    TransactionTypes.WITHDRAW, TransactionTypes.TRANSFER, TransactionTypes.INVESTIMENT_FUNDS, TransactionTypes.DIRECT_TREASURY,
    TransactionTypes.PRIVATE_RETIREMENT, TransactionTypes.STOCKS
]

export type InvestmentTypes = TransactionTypes.INVESTIMENT_FUNDS | TransactionTypes.DIRECT_TREASURY |
            TransactionTypes.PRIVATE_RETIREMENT | TransactionTypes.STOCKS | TransactionTypes.INTEREST;

export function toMoney(money: number) {
    return Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(+money.toFixed(2))
}

