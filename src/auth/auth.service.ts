import { throwError } from 'rxjs';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh.token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService
  ) {
  }
  async login(loginDto: LoginDto) {
    
    const pessoa = await this.pessoaRepository.findOneBy({
      email: loginDto.email,
 
    })
    
    if (!pessoa) {
      throw new UnauthorizedException('Pessoa não autoirizada');
    }
    
      const passwordIsValid = await this.hashingService.compare(
        loginDto.password,
        pessoa.passwordHash
      );
    
    if (!passwordIsValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    return this.createTokens(pessoa);
  }

  private async createTokens(pessoa: Pessoa) {
    const accessToken = await this.singJwtAsync<Partial<Pessoa>>(
      pessoa.id, this.jwtConfiguration.jwtTtl, {
      email: pessoa.email
    })
    const refreshToken = await this.singJwtAsync(
      pessoa.id, 
      this.jwtConfiguration.jwtRefreshTtl)
    return {
      accessToken,
      refreshToken
    }
  }

  private async singJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn
      }
    );
  }

  async refreshTokens (refreshTokenDto: RefreshTokenDto) {
    try {
      const {sub} = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration
      )
      const pessoa = await this.pessoaRepository.findOneBy({
        id: sub,
        active: true
      })

      if(!pessoa) {
        throw new Error(
          'Pessoa não autorizada.'
        )
      }

      return this.createTokens(pessoa)

  } catch (error) {
    throw new UnauthorizedException(
      error.message
    )
  }}
}