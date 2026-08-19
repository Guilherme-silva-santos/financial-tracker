import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformDecimalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }

  private transform(value: any): any {
    if (value instanceof Decimal) {
      return value.toNumber();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item));
    }

    if (value !== null && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        value[key] = this.transform(value[key]);
      }
      return value;
    }

    return value;
  }
}
