import {
  Body,
  Controller,
  CustomDecorator,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/paginatiom.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id-pipe';
import { AuthTokenInterceptor } from 'src/common/interceotors/auth-token-interceptor';
import recadosConfig from './recados.config';
import { ConfigType } from '@nestjs/config';
import { AuthTokenGuard } from 'src/common/guards/auth.token.guard';
import { TokenPayloadParam } from 'src/auth/params/token.payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token.payload.dto';
import { RoutePolicyGuard } from 'src/common/guards/route.policy.guard';
import { ROUTE_POLICY_KEY } from 'src/auth/auth.constants';
import { SetRoutePolicy } from 'src/auth/decorators/set.route.police';
import { RoutePolicyEnum } from 'src/auth/enum/route.policy.enum';

// @UseGuards(RoutePolicyGuard)
@Controller('recados')
export class RecadosController {
  constructor(
    private readonly recadosService: RecadosService,
    @Inject(recadosConfig.KEY)
    private readonly recadosConfiguration: ConfigType<typeof recadosConfig>,

  ) {
  }
  // /recados/
  @Get()
  // @SetRoutePolicy(RoutePolicyEnum.findAllRecados)
  async findAll(@Query() paginationDto: PaginationDto) {
  
    const recados = await this.recadosService.findAll(paginationDto);
    return recados;
  }

  // /recados/:id
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.recadosService.findOne(id);
  }
  @UseGuards(AuthTokenGuard)
  @Post('criar_rec')
  create(
    @Body() createRecadoDto: CreateRecadoDto, 
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    return this.recadosService.create(createRecadoDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch('atualizar_rec/:id')
  update(
    @Param('id') id: number,
    @Body() updateRecadoDto: UpdateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    return this.recadosService.update(id, updateRecadoDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete('deletar_rec/:id')
  remove(
    @Param('id') id: number, 
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    return this.recadosService.remove(id, tokenPayload);
  }
}


