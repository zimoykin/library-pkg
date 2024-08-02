import { Tokens } from '../constants/tokens.constant';
export function getTopicToken(topicName: string, tokenName: keyof Tokens, connectionName?: string) {
    let result = `${tokenName}_${topicName}`;
    if (connectionName) {
        result += `_${connectionName}`;
    }
    return result;
}