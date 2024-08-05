import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user-model.schema";
import { UserModelRepository } from "./user-model.repository";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [UserModelRepository],
    exports: [UserModelRepository]
})
export class UserModelModule { }