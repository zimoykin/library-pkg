# HOW TO USE

This is module of nestjs app is using to subscribe and publish message on kafka

## Installation

import global module on `AppModule`
```typescript
@Module({
  imports: [
    KafkaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        return {
          clientId: config.get('KAFKA_CLIENT_ID'),
          brokers: config.get('KAFKA_BROKERS')
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
import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka.module';
import { QuizzController } from './quizz.controller';
import { QuizzService } from './quizz.service';

@Module({
  imports: [
    KafkaModule.forFeature('foo-updated'),
    KafkaModule.forFeature('quizz-updated'),
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
        @InjectConsumer('quizz-updated') private readonly consumer: KafkaConsumer,
        @InjectProducer('quizz-updated') private readonly producerQuizz: KafkaProducer,
        @InjectProducer('foo-updated') private readonly producerFoo: KafkaProducer,
    ) { }

    onModuleInit() {
        this.logger.debug(`Consumer subscribed to topic ${Quizz.name}`);
        this.consumer.listen(data => {
            this.logger.debug(`Received message ${data} on topic ${Quizz.name}`);
        });
    }

    async publish(data: Record<string, any>) {
        await this.producerQuizz.send({ entityName: Quizz.name, ...data });
        await this.producerFoo.send({ entityName: Foo.name, ...data });
    }
}
```
