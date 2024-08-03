This is module of nestjs app is using to subscribe and publish message on redis, or use cache if it needs

## Installation

```bash
# to install use npm, don't forget to use .npmrc in riit directory of repo
npm install @zimoykin/redis
```

# HOW TO USE

import global module on `AppModule`
```typescript
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        return {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get("REDIS_PASSWORD"),
        };
      },
      inject: [ConfigService]
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
    RedisModule.Cache(), // to use cache import cache service
    RedisModule.forFeature('some-cases') // to use pub or sub service 
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
        @InjectCacheRedis() private readonly redisCacheService: RedisCacheService, //do not forget to inject
        @InjectPubRedisTopic('some-cases') private readonly redisPubService: RedisPubService, //do not forget to inject
        @InjectSubRedisTopic('some-cases') private readonly redisSubService: RedisSubService //do not forget to inject
    ) { }

    async onModuleInit() {
        this.redisSubService.subscribe((data) => {
            this.logger.log(data);
        });
    }

    async setValue(key: string, value: string) {
        await this.redisCacheService.setValue(key, value, { expire: 10_000 });
        await this.redisPubService.publish(JSON.stringify({ key, value }));
        return 'OK';
    }

    async getValue(key: string) {
        return this.redisCacheService.getValueByKey(key);
    }

    async deleteValueByKey(key: string) {
        return this.redisCacheService.setValue(key, null);
    }
}
```
