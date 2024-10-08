import { Column, Entity, Repository } from "typeorm";
import { BaseModel } from "../base.model";

@Entity({ name: 'quizz' })
export class Quizz extends BaseModel {

    @Column({})
    question: string;

    @Column({})
    answer: string;

    constructor(question: string, answer: string) {
        super();

        this.question = question;
        this.answer = answer;
    }

}

export type QuizzRepository = Repository<Quizz & BaseModel>;