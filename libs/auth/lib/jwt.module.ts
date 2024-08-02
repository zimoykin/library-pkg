import { DynamicModule, Module, Provider } from "@nestjs/common";
import { JwtStrategy } from "./jwt.strategy";

export interface JwtAsyncOptions {
    useFactory: (...args: any) => { secret: string; };
    inject: any[];
    imports: any[];
}

@Module({})
export class JwtModule {
    static forRootAsync(opts: JwtAsyncOptions): DynamicModule {
        const providers: Provider[] = [
            JwtStrategy,
            {
                provide: 'JWT_SECRET',
                useFactory: (...args) => {
                    const jwt = opts.useFactory(args);
                    return jwt.secret;
                },
                inject: opts.inject,
            }
        ];
        return {
            module: JwtModule,
            imports: opts.imports ?? [],
            providers: [...providers],
            exports: [...providers],
            global: true //TODO
        };
    }
}