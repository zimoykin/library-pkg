import { BaseModel } from "../base.model";
import { Column, Entity, Repository } from "typeorm";

@Entity({
    name: 'foos'
})
export class Foo extends BaseModel {

    @Column({ unique: true })
    quiestion: string;

    @Column({ unique: true })
    answer: string;

    constructor(quiestion: string, answer: string) {
        super();
        this.quiestion = quiestion;
        this.answer = answer;
    }
}

export type FooRepository = Repository<Foo & BaseModel>;