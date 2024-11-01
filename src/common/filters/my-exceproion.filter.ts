import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
@Catch()
export class MyExceproionFilter implements ExceptionFilter{
  catch(exception: any, host: ArgumentsHost) {  
    throw new Error('Method not implemented.');
  }
} 