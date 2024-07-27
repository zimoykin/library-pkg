export interface KafkaAsyncOptions {
    imports: any[],
    useFactory: (...args: any[]) => any;
    inject?: any[];
  }