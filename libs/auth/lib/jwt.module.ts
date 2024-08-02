import { DynamicModule, Global, Module } from "@nestjs/common";
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
        return {
            module: JwtModule,
            imports: opts.imports ?? [],
            providers: [JwtStrategy, { provide: 'JWT_SECRET', useValue: jwt.secret }],
            exports: [JwtStrategy],
            global: true //TODO
        };
    }
}