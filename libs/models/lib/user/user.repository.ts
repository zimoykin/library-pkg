import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { ClientSession, Document, Model } from "mongoose";
import { USER_ROLE } from "./enums/user-role.enum";

@Injectable()
export class UserRepository {
    private readonly logger = new Logger(UserRepository.name);
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User & Document>
    ) { }

    async findUserById(id: string) {
        return this.userModel.findOne({ _id: id }).lean();
    }

    async findAllUsers() {
        return this.userModel.find({ confirmed: true, blocked: null }).lean();
    }

    async findAllBlockedUsers() {
        return this.userModel.find({ confirmed: true, blocked: { $ne: null } }).lean();
    }

    async findByEmail(email: string, confirmed?: boolean) {
        const query = {
            email: email,
            blocked: null
        };
        if (confirmed != undefined) {
            query['confirmed'] = confirmed;
        }
        return this.userModel.findOne(query).lean();
    }

    async updateByEmail(email: string, role: USER_ROLE, name: string, session: ClientSession) {
        await this.userModel.updateOne({ email: email }, { $set: { email: email, role: role, confirmed: false, name: name } }, { upsert: true, new: true }).session(session);
        return this.userModel.findOne({ email: email }).lean();
    }

    async confirmUserByEmail(email: string, session: ClientSession): Promise<User> {
        await this.userModel.updateOne({ email: email }, { $set: { confirmed: true } }, { upsert: false, new: true }).session(session);
        return this.userModel.findOne({ email: email }).lean();
    }

    async deleteByEmail(email: string): Promise<void> {
        return this.userModel.deleteOne({ email: email }).lean();
    }


    async blockUserById(userId: string): Promise<User> {
        return this.userModel.updateOne({ _id: userId }, { $set: { blocked: new Date() } }, { upsert: false, new: true }).lean();
    }

    async unblockUserById(userId: string): Promise<User> {
        return this.userModel.updateOne({ _id: userId }, { $set: { blocked: null } }, { upsert: false, new: true }).lean();
    }

    async deleteByUserId(userId: string, session: ClientSession): Promise<void> {
        await this.userModel.deleteOne({ _id: userId }).session(session);
    }

}