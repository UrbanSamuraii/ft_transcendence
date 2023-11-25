import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.status(403).json({
      statusCode: 403,
      message: 'You don\'t have permission to access this resource',
    });
  }
}