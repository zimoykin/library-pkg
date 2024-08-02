import { Inject, Injectable, Logger } from "@nestjs/common";
import { Admin, Kafka } from "kafkajs";

@Injectable()
export class KafkaAdminService {
    private readonly logger = new Logger(KafkaAdminService.name);
    private admin?: Admin;
    constructor(
        @Inject('KAFKA_CONNECTION') private readonly kafka: Kafka,
    ) { }

    onModuleInit() {
        this.admin = this.kafka.admin();
    }

    async getTopics() {
        if (!this.admin) {
            throw new Error('KAFKA: Admin not initialized');
        }
        const topics = await this.admin.listTopics();
        return topics;
    }

    async getGroups() {
        if (!this.admin) {
            throw new Error('KAFKA: Admin not initialized');
        }
        const groups = await this.admin.listGroups();
        return groups;
    }

    async getTopicMetadata(topicName: string) {
        if (!this.admin) {
            throw new Error('KAFKA: Admin not initialized');
        }
        const topicMetadata = await this.admin.fetchTopicMetadata({
            topics: [topicName]
        });
        return topicMetadata;
    }

    async deleteTopic(topicName: string) {
        if (!this.admin) {
            throw new Error('KAFKA: Admin not initialized');
        }
        await this.admin.deleteTopics({
            topics: [topicName]
        });
    }

    async createTopic(topicName: string) {
        if (!this.admin) {
            throw new Error('KAFKA: Admin not initialized');
        }
        await this.admin.createTopics({
            topics: [{
                topic: topicName
            }]
        });
    }

    async deleteGroup(groupId: string) {
        if (!this.admin) {
            throw new Error('KAFKA: Admin not initialized');
        }
        await this.admin.deleteGroups([groupId]);
    }

    async fetchTopicOffsets(topic: string) {
        if (!this.admin) {
            throw new Error('KAFKA: Admin not initialized');
        }
        return this.admin.fetchTopicOffsets(topic);
    }
}