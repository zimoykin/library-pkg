import { DynamicModule, Global, Module, UseGuards } from "@nestjs/common";
import { JwtStrategy } from "./jwt.strategy";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { AdminGuard, AuthGuard } from "./guards";

export interface JwtAsyncOptions {
    useFactory: (...args: any) => { secret: string; };
    inject: any[];
    imports: any[];
}
@Global()
@Module({})
export class JwtModule {
    static forRootAsync(opts: JwtAsyncOptions): DynamicModule {
        return {
            module: JwtModule,
            imports: [...opts.imports, ConfigModule],
            providers: [
                JwtStrategy,
                AdminGuard,
                AuthGuard,
                JwtService,
                {
                    provide: 'JWT_SECRET',
                    useFactory: async (...args) => {
                        const config = opts.useFactory(...args);
                        return config.secret;
                    },
                    inject: opts.inject,

                }
            ],
            exports: ['JWT_SECRET', JwtStrategy, JwtService],
            global: true //TODO
        };
    }
}