export interface IConnectionOptions {
    url: string;
}

export interface IConnectionAsyncOptions {
    useFactory: (...args: any[]) => IConnectionOptions;
    inject: any[];
    imports: any[];
}

