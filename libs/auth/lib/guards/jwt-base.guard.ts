import { ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export abstract class BaseJwtGuard {

    constructor(
        @Inject('JWT_SECRET') private readonly secret: string,
        private readonly jwt: JwtService,
    ) { }

    getRequest(context: ExecutionContext) {
        const http = context.switchToHttp();
        let req = http.getRequest();
        return req;
    }

    async validate(token: string): Promise<Record<string, string>> {
        const tokenKey = token.split(' ');
        if (tokenKey.length === 2 && tokenKey[0] === 'Bearer' && tokenKey[1]?.length) {
            const result = await this.jwt.verify(tokenKey[1], { secret: this.secret });
            if (result) {
                return result;
            } else throw new UnauthorizedException();
        } else throw new UnauthorizedException();
    }
} 