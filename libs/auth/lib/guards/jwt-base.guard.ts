import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export abstract class BaseJwtGuard {

    constructor(
        private readonly config: ConfigService,
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
            const secret = this.config.get('JWT_SECRET');
            const result = await this.jwt.verify(tokenKey[1], { secret });
            if (result) {
                return result;
            } else throw new UnauthorizedException();
        } else throw new UnauthorizedException();
    }
} 