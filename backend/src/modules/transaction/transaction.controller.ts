import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, ParseDatePipe, ParseFloatPipe, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard, type AuthorizedRequest } from "src/res/guards/Authenticated.guard";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { type InterceptedFile, TransactionTypes } from "./transaction.entity";
import { FileInterceptor } from "@nestjs/platform-express";


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
    @UseInterceptors(FileInterceptor('img', { limits: { fileSize: 1 * 815 * 1024 } }))   
    async createTransaction(@Req() req: AuthorizedRequest, @Body() dto: CreateTransactionDto, @UploadedFile() img: InterceptedFile) {


        // console.log(`data:${img.mimetype};base64,${Buffer.from(img.buffer).toString('base64')}`)
        

                
        return this.transactionService.createATransaction(req.user.email, +dto.amount, dto.type, img);
    }


    @Delete('/:id')
    deleteTransaction(@Req() req: AuthorizedRequest, @Param('id') transactionId: string) {
        return this.transactionService.deleteATransaction(req.user.email, transactionId);
    }

    @Patch('/:id/:val')
    editTransaction(@Req() req: AuthorizedRequest, @Param('id') transactionId: string, @Param('val', ParseFloatPipe) value: number) {
        return this.transactionService.editATransaction(req.user.email, transactionId, value)
    }

}