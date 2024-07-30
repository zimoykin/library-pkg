import { DynamicModule, InjectionToken } from "@nestjs/common";
import { IRedisOptions } from "./redis-options.interface";

export interface IRedisAsyncOptions {
    inject?: InjectionToken[];
    useFactory: (...args: any[]) => IRedisOptions;
    imports: any[];
}