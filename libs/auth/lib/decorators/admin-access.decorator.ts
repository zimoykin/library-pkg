import { UseGuards } from "@nestjs/common";
import { AdminGuard } from "../guards";

export const AdminAccess = () => {
    return UseGuards(AdminGuard);
};