import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
  } from '@nestjs/common';
  import { ForbiddenException } from '@nestjs/common';
  import { Response, Request } from 'express';
  
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const statusCode = exception.getStatus();
		this.logger.log(`Exception caught in HttpExceptionFilter. Status: ${statusCode}. Request URL: ${request.url}`);
		if (typeof exception.getResponse() === 'string') {
		  response.status(statusCode).send({
			statusCode,
			error: exception.getResponse(),
			path: request.url,
			serverError: true,
		  });
		} else {
		  response.status(statusCode).json(exception.getResponse());
		}
	  }
  }





