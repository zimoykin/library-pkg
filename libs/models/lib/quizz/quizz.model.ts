import { Column, Table } from "sequelize-typescript";
import { BaseModel } from "../base.model";

@Table({ tableName: 'quizz' })
export class Quizz extends BaseModel<Quizz> {

    @Column
    question: string;

    @Column
    answer: string;

    constructor(question: string, answer: string) {
        super();

        this.question = question;
        this.answer = answer;
    }

}