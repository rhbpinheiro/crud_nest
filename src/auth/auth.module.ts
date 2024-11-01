import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from "@nestjs/common";
import { HashingService } from "./hashing/hashing.service";
import { BcryptService } from "./hashing/bcrypt.service";
import { AuthContoller } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Pessoa]), 
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthContoller],
  providers: [
    AuthService,
    {
      provide: HashingService,
      useClass: BcryptService
    }
  ],
  exports: [HashingService, JwtModule, ConfigModule, TypeOrmModule]
})
export class AuthModule { }