import { ErrorCode } from '@app/types/ErrorCode.enum';

export class Response<T> {
  declare ok: boolean;
  declare result: T;
  declare errors: ResponseError[];
}

export class ResponseError {
  declare code: ErrorCode;
  declare message: string;
  declare details: any[];
}
