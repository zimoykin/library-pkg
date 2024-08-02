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
        const jwt = opts.useFactory();
        const providers: Provider[] = [
            JwtStrategy,
            {
                provide: 'JWT_SECRET',
                useFactory: (config) => {
                    return jwt.secret;
                }
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