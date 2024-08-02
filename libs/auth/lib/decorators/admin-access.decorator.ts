import { UseGuards } from "@nestjs/common";
import { AdminGuard } from "../guards";

export const AdminAccess = () => {
    UseGuards(AdminGuard);
};