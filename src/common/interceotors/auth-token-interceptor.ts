import { CallHandler, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
@Injectable()
export class AuthTokenInterceptor { 

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
       throw new UnauthorizedException('Usuário não autorizado');
    }
    return next.handle();
  }
}
