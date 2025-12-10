import { Transaction } from "./Transaction";

export interface User {
    id: string,
    name: string,
    email: string,
    password?: string
    balance: number;
    createdAt: string;
}