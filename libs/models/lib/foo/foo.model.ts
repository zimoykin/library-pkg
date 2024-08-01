import { BaseModel } from "../base.model";
import { Column, Entity, Repository } from "typeorm";

@Entity({
    name: 'foos'
})
export class Foo extends BaseModel {

    @Column({ unique: true })
    question: string;

    @Column({ unique: true })
    answer: string;

    constructor(question: string, answer: string) {
        super();
        this.question = question;
        this.answer = answer;
    }
}

export type FooRepository = Repository<Foo & BaseModel>;