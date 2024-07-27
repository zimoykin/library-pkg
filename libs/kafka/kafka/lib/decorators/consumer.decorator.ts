import { Inject } from '@nestjs/common';
import { getTopicToken } from '../helpers/get-model-token';

export const InjectConsumer = (topicName: string, connectionName?: string) => {
    return Inject(getTopicToken(topicName, 'consumer', connectionName));
};