import { BarType } from "../bar-type.enum";
import { BaseModel } from "../base.model";
import { Column, Entity } from "typeorm";


@Entity({ name: 'bars' })
export class Bar extends BaseModel {

    @Column({ unique: true, type: 'varchar', length: 30 })
    name: string;

    @Column({ enumName: 'bar_types', enum: BarType, default: BarType.First })
    type: BarType;

    constructor(name: string, type?: BarType) {
        super();
        this.name = name;
        this.type = type ?? BarType.First;
    }
}