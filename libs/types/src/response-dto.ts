import { BadRequestException, ConflictException, Logger, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { BaseDto } from "./dtos/abstract-base-dto";

/**
 * Returns a function that handles the response of a promise and converts it to an instance of the specified class.
 *
 * @template T - The type of the class to convert the response to.
 * @param {new (...data: any) => T} cls - The class constructor to instantiate the response with.
 * @return {Promise<any>} - A promise that resolves to the converted response or rejects with an error.
 */
export const CustomResponse = <T extends BaseDto>(cls: new (...data: any) => T) => {
    const responseLogger = new Logger(cls.name);
    return async function safetyResponseHandle<R = any>(result: Promise<R | R[]>): Promise<T | T[] | any> {
        return result.then(data => {
            return Array.isArray(data)
                ? data.map(item => plainToInstance(cls, item)) as T[]
                : plainToInstance(cls, data) as T;
        }).catch(error => {
            responseLogger.error(error);
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error?.message);
            }
            else if (error instanceof BadRequestException) {
                throw new BadRequestException(error?.message);
            } else if (error instanceof ConflictException) {
                throw new ConflictException(error?.message);
            } else
                throw new Error(error?.message ?? 'unknown error');
        });
    };
};