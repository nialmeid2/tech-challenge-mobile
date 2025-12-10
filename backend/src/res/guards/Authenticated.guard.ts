import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from '@nestjs/jwt';

export interface AuthorizedRequest extends Request {
    user: {
        email: string,
        sub: string
    }
}

export interface AuthorizationPayload {
    sub: string;
    email: string;    
}

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(@Inject() private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext) {
        
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest<AuthorizedRequest>();

        const authorization = httpContext.getRequest<Request>().headers.authorization;
        const authWords = authorization?.split(' ');
        if (!authWords || authWords.length < 2) {
            throw new HttpException("Usuário não autorizado", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            
            const verification = this.jwtService.decode<AuthorizationPayload>(authWords[1]);
            
            req.user = {
                email: verification.email,
                sub: verification.sub
            }

            return true;
        } catch (err) {
            console.log(err);
            throw new HttpException("Usuário não autorizado", HttpStatus.UNAUTHORIZED);
        }

    }

}