import { Picker } from '@react-native-picker/picker'
import { Fragment } from 'react'
import { ColorValue, StyleProp, TextStyle } from 'react-native'

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

export type InvestmentTransactions =
    TransactionTypes.INVESTIMENT_FUNDS | TransactionTypes.DIRECT_TREASURY | TransactionTypes.PRIVATE_RETIREMENT | TransactionTypes.STOCKS | TransactionTypes.INTEREST

export type InvestmentTypes = TransactionTypes.INVESTIMENT_FUNDS | TransactionTypes.DIRECT_TREASURY |
            TransactionTypes.PRIVATE_RETIREMENT | TransactionTypes.STOCKS | TransactionTypes.INTEREST

export function TransactionOptionItems<T>({val, setVal, style, dropDownIconColor = 'black'} : {
    val: T,
    dropDownIconColor?: number | ColorValue,
    setVal: React.Dispatch<React.SetStateAction<T>>,
    style: StyleProp<TextStyle>
}) {
    return <Picker style={style} selectedValue={val || ''} dropdownIconColor={dropDownIconColor} onValueChange={(v) => setVal(v as TransactionTypes)}>
        <Picker.Item value="" label="Selecione o tipo de transação" />
        <Picker.Item value={TransactionTypes.DEPOSIT} label={TransactionTypes.DEPOSIT} />
        <Picker.Item value={TransactionTypes.INCOME} label={TransactionTypes.INCOME} />
        <Picker.Item value={TransactionTypes.WITHDRAW} label={TransactionTypes.WITHDRAW} />
        <Picker.Item value={TransactionTypes.TRANSFER} label={TransactionTypes.TRANSFER} />
        <Picker.Item value={TransactionTypes.INVESTIMENT_FUNDS} label={TransactionTypes.INVESTIMENT_FUNDS} />
        <Picker.Item value={TransactionTypes.DIRECT_TREASURY} label={TransactionTypes.DIRECT_TREASURY} />
        <Picker.Item value={TransactionTypes.PRIVATE_RETIREMENT} label={TransactionTypes.PRIVATE_RETIREMENT} />
        <Picker.Item value={TransactionTypes.STOCKS} label={TransactionTypes.STOCKS} />
        <Picker.Item value={TransactionTypes.INTEREST} label={TransactionTypes.INTEREST} />
    </Picker>
}

export const transactionsPerPage = 10;