import { TransactionTypes } from "./enums/Transaction";


export interface Transaction {
    id: string;
    type: TransactionTypes;
    value: number;
    createdAt: Date;
    userId: number;
    file: string | undefined;
}


export function addDays(date: Date, days: number) {
    const result = new Date(date); // Create a copy to avoid modifying the original
    result.setDate(result.getDate() + days);
    return result;
}
