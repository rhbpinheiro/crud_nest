import { REQUEST_TOKEN_PAYLOAD_KEY } from './../../auth/auth.constants';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from "express";
import jwtConfig from "src/auth/config/jwt.config";
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Não Logado');
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      )

      const pessoa = await this.pessoaRepository.findOneBy({
        id: payload.sub,
        active: true
      })
      
      if (!pessoa) {
        throw new UnauthorizedException('Pessoa não autorizada');
      }

      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;
    } catch (err) {
      throw new UnauthorizedException('Falha ao Logar');
    }

    return true;
  }
  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;
    if (!authorization || typeof authorization !== 'string') {
      return;
    }

    return authorization.split(' ')[1];

  }
}