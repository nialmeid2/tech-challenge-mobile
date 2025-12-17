import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "src/config/firebase";
import { UserEntity } from "./user.entity";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

@Injectable()
export class UserService {
    
    async registerUser(newUser: Omit<UserEntity, 'id'>) {

        const userMail = newUser.email

        try {
            const credentials = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password!);

            
            const newDoc = await addDoc(collection(db, 'users'), {
                name: newUser.name,
                email: newUser.email,
                balance: newUser.balance,
                createdAt: newUser.createdAt,                
            })
            
            delete newUser.password;

            return { 
                'user': { id: newDoc.id, ...newUser },
                'token': await credentials.user.getIdToken(true)
            }
        } catch (err) {
            console.log(err);
            console.log(newUser.email)
            throw new HttpException(`O e-mail ${userMail} já está em uso`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkLogin(email: string, pass: string) {
        try {
            const credentials = await signInWithEmailAndPassword(auth, email, pass);

            if (credentials.user) {
                const userQuery = query(collection(db, 'users'), where("email", "==", email))
                const returnedUser = await getDocs(userQuery)
                                
                return { 
                    'user': returnedUser.docs ? { 'id': returnedUser.docs[0].id, ...returnedUser.docs[0].data() } : null, // if user is logged in, there's probably a found user
                    'token': await credentials.user.getIdToken(true)
                }
            }

            throw new HttpException("E-mail e/ou Senha incorretos", HttpStatus.NOT_FOUND);
            
        } catch (err) {
            console.log(err);
            throw new HttpException("E-mail e/ou Senha incorretos", HttpStatus.NOT_FOUND)
        }
    }

}