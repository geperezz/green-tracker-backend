import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response as ExpressResponse } from 'express';

export type SuccessfulResponse = {
  statusCode: number;
  data: unknown;
};

@Injectable()
export class SuccessfulResponseBuilderInterceptor
  implements NestInterceptor<unknown, SuccessfulResponse | StreamableFile>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<SuccessfulResponse | StreamableFile> {
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) return data;
        return {
          statusCode: response.statusCode,
          data,
        };
      }),
    );
  }
}
