import { Body, Controller, Get, Inject, ParseDatePipe, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, type AuthorizedRequest } from "src/res/guards/Authenticated.guard";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { TransactionTypes } from "./transaction.entity";


@Controller('/transaction')
@UseGuards(AuthGuard)
export class TransactionController {

    constructor(@Inject() private transactionService: TransactionService) { }

    @Get('/statement')
    userStatement(@Req() req: AuthorizedRequest) {
        return this.transactionService.getUserStatement(req.user.email);
    }

    @Get('/search')
    searchTransactions(@Req() req: AuthorizedRequest, @Query('pick') pickId: string | undefined,
        @Query('from') startDate: string, @Query('to') endDate: string, 
        @Query('type') type: TransactionTypes, @Query('perPage', ParseIntPipe) perPage: number) {
        
        return this.transactionService.getFilteredTransactions(pickId, 
            new Date(startDate), new Date(endDate), type, req.user.email, perPage);
    }

    @Get('/investments')
    searchInvestments(@Req() req: AuthorizedRequest) {
        return this.transactionService.getInvestments(req.user.email)
    }

    @Post('/statement')
    createTransaction(@Req() req: AuthorizedRequest, @Body() dto: CreateTransactionDto) {
        return this.transactionService.createATransaction(req.user.email, dto.amount, dto.type);
    }


}