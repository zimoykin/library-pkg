import { Inject } from "@nestjs/common";
import { getSenderToken } from "./sender-token.helper";
import { AMQPTopics } from "lib/common/message";

export const InjectSender = (pattern: AMQPTopics) => {
    return Inject(getSenderToken(String(pattern)));
};