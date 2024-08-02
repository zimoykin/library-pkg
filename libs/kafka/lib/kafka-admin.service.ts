import { Inject, Injectable, Logger } from "@nestjs/common";
import { Kafka } from "kafkajs";

@Injectable()
export class KafkaAdminService {
    private readonly logger = new Logger(KafkaAdminService.name);
    constructor(
        @Inject('KAFKA_CONNECTION') private readonly kafka: Kafka,
    ) { }

    async getTopics() {
        const topics = await this.kafka.admin().listTopics();
        return topics;
    }

    async getTopicstopicsMetadata(topicName: string) {
        const topicsMetadata = await this.kafka.admin().fetchTopicMetadata({
            topics: [topicName]
        });
        return topicsMetadata;
    }
}