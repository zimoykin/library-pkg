import { Foo } from "../foo/foo.model";
import { BarType } from "../bar-type.enum";
import { BaseModel } from "../base.model";
import { Column, Entity, OneToOne } from "typeorm";


@Entity({ name: 'bars' })
export class Bar extends BaseModel {

    @Column({ unique: true, type: 'varchar', length: 30 })
    name: string;

    @Column({ enumName: 'bar_types', enum: BarType, default: BarType.First })
    type: BarType;

    @OneToOne(() => Foo, foo => foo.id, { cascade: true })
    fooId: string;

    constructor(name: string, fooId: string, type?: BarType) {
        super();
        this.name = name;
        this.fooId = fooId;
        this.type = type ?? BarType.First;
    }
}