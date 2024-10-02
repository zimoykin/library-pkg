import { Inject } from "@nestjs/common";
import { getSenderToken } from "./sender-token.helper";

export const InjectSender = (pattern: string) => {
    return Inject(getSenderToken(pattern.toLowerCase()));
};