import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "../model/User";
import * as Keychain from 'react-native-keychain'
import { AppConstants } from "@src/model/Constants";
import { Transaction } from "@src/model/Transaction";


interface Props {
    user?: User;
    isLoading: boolean;
    token: string;
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
    setToken: React.Dispatch<React.SetStateAction<string>>;
    statement: Transaction[];
    updateStatement: () => Promise<void>
    setStatement: React.Dispatch<React.SetStateAction<Transaction[]>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isRefreshing: boolean;
    refreshStatement: () => void;
    logout: () => Promise<void>;
}

export const UserContext = createContext({} as Props);

interface StatementResponse {
    statement: Transaction[];
    user: User
}

export default function UserProvider({ children }: {
    children?: ReactNode
}) {

    const [user, setUser] = useState<User | undefined>(undefined);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statement, setStatement] = useState<Transaction[]>([]);
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    async function logout() {

        try {
            await Keychain.resetGenericPassword({
                service: AppConstants.APP_STORAGE_KEY
            });
        } catch (err) {
            console.log(err)
        }

        setToken('');
        setUser(undefined);

    }

    async function updateStatement() {

        if (!user)
            return;

        const response: StatementResponse = await fetch(`${process.env.BACKEND_URL}transaction/statement`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json())
            .catch(err => console.log(err));

        setStatement(response.statement)
        setUser(response.user);

    }

    async function refreshStatement() {
        setIsRefreshing(true);
        try {

            await updateStatement();
            setIsRefreshing(false);

        } catch (err) {
            console.log(err);
            setIsRefreshing(false);
        }

    }


    useEffect(() => {


        Keychain.getGenericPassword({
            service: AppConstants.APP_STORAGE_KEY,
        }).then((key) => {
            setIsLoading(false);

            if (!key) {
                return;
            }

            setToken(key.password);
            setUser({ email: key.username } as User);

        }).catch((err) => {

            console.log(err);
            setIsLoading(false);

        });

    }, []);

    return <UserContext.Provider value={{ user, isLoading, setUser, setIsLoading, token, setToken, statement, setStatement, updateStatement, isRefreshing, refreshStatement, logout }}>
        {children}
    </UserContext.Provider>
}