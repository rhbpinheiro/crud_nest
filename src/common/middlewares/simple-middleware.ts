// Cliente (Navegador) -> Servidor -> Middleware (request, response) 

import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

//-> Nestjs (Guards, Interceptors, Pipes, Filters) 
export class SimpleMiddleware implements NestMiddleware {

  use(req: Request, res: Response, next: NextFunction) { 
    console.log("SimpleMiddleware");
    // return res.status(404).send({
    //   message: 'Não encontraDO'
    // });

    next();
  }
  
}