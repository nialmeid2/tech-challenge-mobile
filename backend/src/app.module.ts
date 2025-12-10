import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
    imports: [UserModule, TransactionModule,
        ConfigModule.forRoot({
            isGlobal: true
        }),
        JwtModule.register({ // async so server won't lock the main thread if something takes too long
            global: true,
        })
    ],
    
})
export class AppModule { }
