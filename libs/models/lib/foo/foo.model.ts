import { BaseModel } from "lib/base.model";
import { Column, Table } from "sequelize-typescript";

@Table
export class Foo extends BaseModel<Foo> {

    @Column
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }
}