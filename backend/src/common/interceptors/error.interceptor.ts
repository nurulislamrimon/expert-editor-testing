import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || 'Internal server error';

        return throwError(
          () =>
            new HttpException(
              {
                statusCode: status,
                message,
                error: 'Internal Server Error',
              },
              status,
            ),
        );
      }),
    );
  }
}
