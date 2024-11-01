import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
@Injectable()
export class TimeConnectionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const start = new Date().getTime();
    return next.handle().pipe(
      tap(() => {
        const end = new Date().getTime();
        const time = end - start;
        response.header('X-Response-Time', `${time}ms`);
      }),
    );
  }
}
