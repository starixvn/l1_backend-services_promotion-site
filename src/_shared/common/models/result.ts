import { ApiProperty } from '@nestjs/swagger';

export interface IResult<T> {
    errorCode: number;

    errorMessage: string;

    isSuccessful: boolean;

    data: T;
}

export class Result<T> implements IResult<T> {
    constructor(errorCode: number, errorMessage: string, data: T = null) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.data = data;
        this.isSuccessful = this.errorCode === ErrorCodes.Success;
    }

    @ApiProperty()
    errorCode: number;

    @ApiProperty()
    errorMessage: string;

    @ApiProperty()
    isSuccessful: boolean;

    data: T;
}

export class NumericalResult extends Result<number> {
    @ApiProperty()
    data: number;
}

export const ResultDecorator = <T>(DataClass) => {
    class ResultDecorator implements IResult<T> {
        @ApiProperty()
        errorCode: number;

        @ApiProperty()
        errorMessage: string;

        @ApiProperty()
        isSuccessful: boolean;

        @ApiProperty({ type: DataClass })
        data: T;
    }

    return ResultDecorator;
};

export const ErrorCodes = {
    Success: 0,
    Failed: 1,
};

export const ErrorMessages = {
    Empty: '',
};
