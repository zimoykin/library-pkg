import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { BaseJwtGuard } from './jwt-base.guard';

@Injectable()
export class AuthGuard extends BaseJwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    let req = http.getRequest();
    if (!req.headers.authorization) return false;
    else {
      try {
        const { id, role, email } = await this.validate(req.headers.authorization);
        if (id && role && email) {
          req.auth = { id, role, email };
        }
        return req.auth !== undefined;
      } catch (error) {
        throw new ForbiddenException('wrong access token');
      }
    }
  }
}
