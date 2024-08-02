import { DynamicModule, Global, Module } from "@nestjs/common";
import { JwtStrategy } from "./jwt.strategy";
import { JwtService } from "@nestjs/jwt";

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
            imports: opts.imports ?? [],
            providers: [
                JwtStrategy,
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