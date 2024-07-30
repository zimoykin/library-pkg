import { BarType } from "../bar-type.enum";
import { BaseModel } from "../base.model";
import { Column, DataType, Table } from "sequelize-typescript";


@Table
export class Bar extends BaseModel<Bar> {

    @Column
    name: string;

    @Column(DataType.ENUM({ values: Object.values(BarType) }))
    type: BarType;

    constructor(name: string, type?: BarType) {
        super();
        this.name = name;
        this.type = type ?? BarType.First;
    }
}