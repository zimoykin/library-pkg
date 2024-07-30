import { BaseModel } from "../base.model";
import { Column, DataType, Table } from "sequelize-typescript";
import { BarType } from "../../../enums";


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