import { Inject } from "@nestjs/common";
import { getConsumerToken } from "./sender-token.helper";

export const InjectConsumer = (pattern: string) => {
    return Inject(getConsumerToken(pattern.toLowerCase()));
};