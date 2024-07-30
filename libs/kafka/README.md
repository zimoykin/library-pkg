This is module of nestjs app is using to subscribe and publish message on kafka

## Installation

```bash
# to install use npm, don't forget to use .npmrc in riit directory of repo
npm install @zimoykin/kafka
```

# HOW TO USE

import global module on `AppModule`
```typescript
@Module({
  imports: [
    // IMPORT HERE
    RedisModule.forRoot('127.0.0.1', 6379, 'default', 'quizz'),
    // OR ASYNC WAY (preferable)
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<KafkaCloudConfigVariables>) => {
        const host = config.get<string>('REDIS_HOST')!;
        const port = config.get<number>('REDIS_PORT')!;
        const username = config.get<string>('REDIS_USERNAME')!;
        const password = config.get<string>('REDIS_PASSWORD')!;
        return { host, port, username, password };
      }
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema
    }),
    QuizzModule,
    FooModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
```

put topic into module

```typescript

@Module({
  imports: [
    RedisModule.forFeature('foo-updated'),
    RedisModule.forFeature('quizz-updated'),
    ],
  controllers: [QuizzController],
  providers: [QuizzService]
})
export class QuizzModule { }
```

`using in provider`
```typescript
@Injectable()
export class QuizzService implements OnModuleInit {
    private readonly logger = new Logger(QuizzService.name);
    constructor(
        @InjectPubRedisTopic(Quizz.name.toLowerCase()) private readonly pubRedis: RedisPubService
    ) { }

    onModuleInit() {  }

    async publish(data: Record<string, any>) {
        await this.pubRedis.send(Quizz.name.toLowerCase(), { entityName: Foo.name, ...data });
    }
}
```
