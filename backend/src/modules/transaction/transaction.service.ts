import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { collection, query, where, orderBy, limit, getDocs, doc, addDoc, setDoc, QueryConstraint, startAfter, getDoc, sum, getAggregateFromServer } from "firebase/firestore";
import { db } from "src/config/firebase";
import { InvestmentTypes, SubtractiveTransactions, TransactionEntity, TransactionTypes } from "./transaction.entity";
import { UserEntity } from "../user/user.entity";



@Injectable()
export class TransactionService {

    async getUserStatement(email: string, statementSize = 30) {

        let returnJson: Record<string, UserEntity | TransactionEntity[]> = {};

        try {

            returnJson.user = await this._getUserByEmail(email);
            returnJson.statement = [];

        } catch (err) {
            console.log(err)
            throw new HttpException("Erro carregando extrato", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (statementSize < 1)
            return returnJson;

        try {
            const userId = returnJson.user.id;
            delete returnJson.user.id;

            const transactionQuery = query(collection(db, 'transactions'),
                where("userId", "==", userId),
                orderBy('createdAt', 'desc'),
                limit(statementSize))
            const statement = await getDocs(transactionQuery);

            returnJson.statement = statement.docs.map(s => ({...s.data(), id: s.id })) as TransactionEntity[];

        }  catch(err) {
            console.log(err)
        }        
        finally {
            return returnJson;
        }


    }

    private async _getUserByEmail(email: string) {
        const userQuery = query(collection(db, 'users'), where('email', '==', email))
        const user = await getDocs(userQuery);

        if (!user.docs?.length)
            throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);

        const userId = user.docs[0].id;

        return { id: userId, ...user.docs[0].data() } as UserEntity
    }

    async getFilteredTransactions(pickId: string | undefined, startDate: Date, endDate: Date, type: TransactionTypes, email: string, perPage = 10) {
        
        perPage = perPage < 10 ? 10 : perPage > 50 ? 50 : perPage;

        const user = await this._getUserByEmail(email);

        if (startDate > endDate) {
            const swap = startDate;
            startDate = endDate;
            endDate = swap;
        }

        const constrainsts: QueryConstraint[] = [];


        constrainsts.push(where('createdAt', '>=', startDate.toISOString().split('T')[0] + 'T00:00:00.000Z'));

        constrainsts.push(where('createdAt', '<=', endDate.toISOString().split('T')[0] + 'T23:59:59.999Z' ));

        constrainsts.push(where('userId', '==', user.id));

        if (type)
            constrainsts.push(where('type', '==', type))

        constrainsts.push(orderBy('createdAt', 'desc'));
        constrainsts.push(limit(perPage));

        

        if (pickId)
            constrainsts.push(startAfter(await getDoc(doc(db, 'transactions', pickId))))

        const transactionsQuery = query(collection(db, 'transactions'), ...constrainsts);
        const transactions = await getDocs(transactionsQuery);
        

        return transactions.docs.map((t) => ({id: t.id, ...t.data() }));
        
    }

    async getInvestments(email: string) {
        const user = await this._getUserByEmail(email);

        const investments: InvestmentTypes[] = [TransactionTypes.INVESTIMENT_FUNDS, TransactionTypes.DIRECT_TREASURY, 
            TransactionTypes.PRIVATE_RETIREMENT, TransactionTypes.STOCKS, TransactionTypes.INTEREST]
        const stmt = {} as Record<InvestmentTypes, number>;
        let total = 0;

        for (let i = 0; i < investments.length; i++) {
            const transactionQuery = query(collection(db, 'transactions'), where('type', '==', investments[i]))
            const totalForType = await getAggregateFromServer(transactionQuery, {
                'total': sum('value')
            });

            


            stmt[investments[i]] = Math.abs(totalForType.data().total);
            total += stmt[investments[i]]
        }

        return {
            investments: stmt,
            total
        }
    }

    async createATransaction(email: string, amount: number, type: TransactionTypes) {
        try {

            const user = await this._getUserByEmail(email);
            const userId = user.id!; 

            delete user.id;

            const transaction: Omit<TransactionEntity, 'id'> = {
                createdAt: new Date().toISOString(),
                type,
                userId,
                value: amount
            }

            if (SubtractiveTransactions.find(t => type == t)) {
                transaction.value *= -1; // subtractive transactions always subtractive from total balance
            }

            user.balance += transaction.value;

            if (user.balance < 0) {
                throw new HttpException(`Saldo insuficiente para realizar operação ${type.toString()}`, HttpStatus.UNPROCESSABLE_ENTITY);
            }

            await setDoc(doc(db, 'users', userId), { ...user });
            
            await addDoc(collection(db, 'transactions'), {
                ...transaction
            })


            return { message: "Transação criada com sucesso", status: HttpStatus.CREATED };

        } catch (err) {
            console.log(err);
            throw new HttpException("Erro criando transação", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}