import { BaseModel } from "lib/base.model";
import { Column, Table } from "sequelize-typescript";
import {  } from "@zimoykin/enums";


@Table
export class Bar extends BaseModel<Bar> {

    @Column
    name: string;

    @Column
    type: any; // bartype from enums

    constructor(name: string) {
        super();
        this.name = name;
    }
}