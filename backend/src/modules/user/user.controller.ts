import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CredentialsDto } from "./dto/credentials.dto";
import { RegisterDto } from "./dto/register.dto";


@Controller("/user")
export class UserController {

    constructor(@Inject() private userService: UserService) {}

    @Post('/login')
    async doLogin(@Body() credentials: CredentialsDto) {
        return await this.userService.checkLogin(credentials.email, credentials.password);
    }

    @Post('/register')
    async doRegister(@Body() userData: RegisterDto) {
        return await this.userService.registerUser({ ...userData, createdAt: new Date().toISOString(), balance: 0 });
    }

    @Get()
    checkHealth() {
        return "I'm healthy"
    }

}