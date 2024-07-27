import { Inject } from '@nestjs/common';
import { getTopicToken } from '../helpers/get-model-token';

export const InjectProducer = (topicName: string, connectionName?: string) => {
    return Inject(getTopicToken(topicName, 'producer', connectionName));
};;