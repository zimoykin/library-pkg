import { AMQPTopics } from "../common/message";

export const getSenderToken = (pattern: AMQPTopics) => `amqp:sender:${pattern}`;
export const getConsumerToken = (pattern: AMQPTopics) => `amqp:consumer:${pattern}`;