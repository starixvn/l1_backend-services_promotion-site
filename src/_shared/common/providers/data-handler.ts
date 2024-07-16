import { Inject, Injectable } from '@nestjs/common';
import { FilterQuery, Model, QueryOptions, UpdateQuery, Document } from 'mongoose';
import { ErrorCodes, ErrorMessages, Result } from '../models/result';
import { SentryLogger } from './logger.service';

@Injectable()
export class DataHandler {
    private readonly logger: SentryLogger;

    constructor(@Inject(SentryLogger) logger: SentryLogger) {
        this.logger = logger;
    }

    async createData<T>(model: Model<any>, doc: any): Promise<Result<T>> {
        try {
            const result = await model.create(doc);
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }

    async getData<T>(promise: Promise<T>): Promise<Result<T>> {
        try {
            const result = await promise;
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }

    async getDataAndUpdate<T>(
        model: Model<any>,
        filter: FilterQuery<Document>,
        updates: UpdateQuery<Document>,
        options?: QueryOptions,
    ): Promise<Result<T>> {
        try {
            const result = await model.findOneAndUpdate(filter, updates, options).lean().exec();
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }

    async updateData<T>(
        model: Model<any>,
        filter: FilterQuery<Document>,
        updates: UpdateQuery<Document>,
        options?: QueryOptions,
    ): Promise<Result<T>> {
        try {
            const result = await model.updateOne(filter, updates, options).lean().exec();
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }

    async updateManyData<T>(
        model: Model<any>,
        filter: FilterQuery<Document>,
        updates: UpdateQuery<Document>,
        options?: QueryOptions,
    ): Promise<Result<T>> {
        try {
            const result = await model.updateMany(filter, updates, options).exec();
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }

    async deleteMany<T>(model: Model<any>, filter: FilterQuery<Document>, options?: QueryOptions): Promise<Result<T>> {
        try {
            const result = await model.deleteMany(filter, options).lean().exec();
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }

    async insertMany<T>(model: Model<any>, data: any): Promise<Result<T>> {
        try {
            const result = await model.insertMany(data);
            return new Result(ErrorCodes.Success, ErrorMessages.Empty, result);
        } catch (error) {
            this.logger.error(error);
            return new Result(ErrorCodes.Failed, error.message);
        }
    }
}
