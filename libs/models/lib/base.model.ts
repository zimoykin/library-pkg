import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
@Table({ paranoid: true, timestamps: true })
export abstract class BaseModel<M extends BaseModel = any> extends Model<InferAttributes<M>, InferCreationAttributes<M>> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column
    createdAt!: Date;

    @Column
    updatedAt!: Date;

}