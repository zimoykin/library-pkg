import { BaseModel } from "lib/base.model";
import { Column, Entity } from "typeorm";

@Entity({
    name: 'foos',
    schema: 'public'
})
export class Foo extends BaseModel {

    @Column({ unique: true, type: 'varchar', length: 30 })
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }
}