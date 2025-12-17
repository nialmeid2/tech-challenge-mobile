import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { collection, query, where, orderBy, limit, getDocs, doc, addDoc, setDoc, QueryConstraint, startAfter, getDoc, sum, getAggregateFromServer, deleteDoc } from "firebase/firestore";
import { db } from "src/config/firebase";
import { AdditiveTransactions, InterceptedFile, InvestmentTypes, SubtractiveTransactions, toMoney, TransactionEntity, TransactionTypes } from "./transaction.entity";
import { UserEntity } from "../user/user.entity";
import { Buffer } from "buffer";



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

            returnJson.statement = statement.docs.map(s => ({ ...s.data(), id: s.id })) as TransactionEntity[];

        } catch (err) {
            console.log(err)
            throw err;
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
        constrainsts.push(where('createdAt', '<=', endDate.toISOString().split('T')[0] + 'T23:59:59.999Z'));
        constrainsts.push(where('userId', '==', user.id));

        if (type)
            constrainsts.push(where('type', '==', type))

        constrainsts.push(orderBy('createdAt', 'desc'));
        constrainsts.push(limit(perPage));



        if (pickId)
            constrainsts.push(startAfter(await getDoc(doc(db, 'transactions', pickId))))

        const transactionsQuery = query(collection(db, 'transactions'), ...constrainsts);
        const transactions = await getDocs(transactionsQuery);


        return transactions.docs.map((t) => ({ id: t.id, ...t.data() }));

    }

    async getInvestments(email: string) {
        const user = await this._getUserByEmail(email);

        const investments: InvestmentTypes[] = [TransactionTypes.INVESTIMENT_FUNDS, TransactionTypes.DIRECT_TREASURY,
        TransactionTypes.PRIVATE_RETIREMENT, TransactionTypes.STOCKS, TransactionTypes.INTEREST]
        const stmt = {} as Record<InvestmentTypes, number>;
        let total = 0;

        for (let i = 0; i < investments.length; i++) {
            const transactionQuery = query(collection(db, 'transactions'), where('type', '==', investments[i]), where('userId', '==', user.id))
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

    async createATransaction(email: string, amount: number, type: TransactionTypes, file: InterceptedFile | undefined) {
        try {

            const user = await this._getUserByEmail(email);
            const userId = user.id!;

            delete user.id;

            const transaction: Omit<TransactionEntity, 'id'> = {
                createdAt: new Date().toISOString(),
                type,
                userId,
                value: amount,
                file: undefined
            }

            if (!file)
                delete transaction.file;
            else {
                transaction.file = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString('base64')}`;
            }


            if (SubtractiveTransactions.find(t => type == t)) {
                transaction.value *= -1; // subtractive transactions always subtractive from total balance
            }

            user.balance += transaction.value;

            if (user.balance < 0) {
                throw new HttpException(`Saldo insuficiente para realizar operação ${type.toString()}`, HttpStatus.UNPROCESSABLE_ENTITY);
            }

            await addDoc(collection(db, 'transactions'), {
                ...transaction
            })

            await setDoc(doc(db, 'users', userId), { ...user });



            return { message: "Transação criada com sucesso", status: HttpStatus.CREATED };

        } catch (err) {
            console.log(err);
            if (err instanceof HttpException)
                throw err;
            else
                throw new HttpException('Erro deletando transação', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    async deleteATransaction(email: string, transactionId: string) {

        try {

            const user = await this._getUserByEmail(email);
            const userId = user.id!;

            delete user.id;

            const theTransaction = await getDoc(doc(db, 'transactions', transactionId));

            if (!theTransaction.exists)
                throw new HttpException(`Transação não encontrada!`, HttpStatus.NOT_FOUND);

            const transactionObj = { ...theTransaction.data() } as TransactionEntity;
            let transactionDiff = Math.abs(transactionObj.value);

            if (AdditiveTransactions.find((type) => type == transactionObj.type))
                transactionDiff *= -1;

            const newBalance = user.balance + transactionDiff;

            if (newBalance < 0)
                throw new HttpException(`Não há saldo suficiente para excluir essa transação (falta ${toMoney(Math.abs(newBalance))})`, HttpStatus.UNPROCESSABLE_ENTITY);

            user.balance = newBalance;

            await setDoc(doc(db, 'users', userId), { ...user });
            await deleteDoc(doc(db, 'transactions', transactionId));


            return { message: 'Transação Deletada com sucesso', status: 200 }


        } catch (err) {

            console.log(err);


            if (err instanceof HttpException)
                throw err;
            else
                throw new HttpException('Erro deletando transação', HttpStatus.INTERNAL_SERVER_ERROR)

        }

    }

    async editATransaction(email: string, transactionId: string, value: number) {

        try {

            const user = await this._getUserByEmail(email);
            const userId = user.id!;
            const theValue = Math.abs(value);

            delete user.id;

            const theTransaction = await getDoc(doc(db, 'transactions', transactionId));

            if (!theTransaction.exists)
                throw new HttpException(`Transação não encontrada!`, HttpStatus.NOT_FOUND);

            const transactionObj = { ...theTransaction.data() } as TransactionEntity;
            let newBalance = user.balance;

            if (SubtractiveTransactions.includes(transactionObj.type)) {
                const balanceDifference = theValue - Math.abs(transactionObj.value)
                newBalance -= balanceDifference;
                transactionObj.value = -theValue
            } else {
                const balanceDifference = Math.abs(transactionObj.value) - theValue;
                newBalance -= balanceDifference;
                transactionObj.value = theValue;
            }


            if (newBalance < 0)
                throw new HttpException(`Não há saldo suficiente para editar essa transação (por ${toMoney(Math.abs(newBalance))})`, HttpStatus.UNPROCESSABLE_ENTITY);

            user.balance = newBalance;


            await setDoc(doc(db, 'users', userId), { ...user });
            await setDoc(doc(db, 'transactions', transactionId), { ...transactionObj });


            return { message: 'Transação Editada com sucesso', status: 200 }


        } catch (err) {

            console.log(err);


            if (err instanceof HttpException)
                throw err;
            else
                throw new HttpException('Erro editando transação', HttpStatus.INTERNAL_SERVER_ERROR)

        }

    }

}