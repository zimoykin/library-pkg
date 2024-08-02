import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guards";

export const UserAccess = () => {
    return UseGuards(AuthGuard);
};