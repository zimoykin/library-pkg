import { Foo } from "../foo/foo.model";
import { BarType } from "../bar-type.enum";
import { BaseModel } from "../base.model";
import { Column, Entity, JoinColumn, OneToOne, Repository } from "typeorm";


@Entity({ name: 'bars' })
export class Bar extends BaseModel {

    @Column({ unique: true, type: 'varchar', length: 30 })
    name: string;

    @Column({ enumName: 'bar_types', enum: BarType, default: BarType.First })
    type: BarType;

    @OneToOne(() => Foo, foo => foo.id, { cascade: true })
    @JoinColumn()
    foo: Foo;

    constructor(name: string, foo: Foo, type?: BarType) {
        super();
        this.name = name;
        this.foo = foo;
        this.type = type ?? BarType.First;
    }
}

export type BarRepository = Repository<Bar & BaseModel>;