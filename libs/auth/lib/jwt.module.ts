import { DynamicModule, Global, Module } from "@nestjs/common";
import { JwtStrategy } from "./jwt.strategy";

export interface JwtAsyncOptions {
    useFactory: (...args: any[]) => any;
    inject: any[];
    imports: any[];
}

@Global()
@Module({
    providers: [JwtStrategy],
    exports: [JwtStrategy]
})
export class JwtModule {
    static forRootAsync(opts: JwtAsyncOptions): DynamicModule {
        return {
            module: JwtModule,
            imports: opts.imports ?? [],
            providers: [JwtStrategy],
            exports: [JwtStrategy],
            global: true //TODO
        };
    }
}