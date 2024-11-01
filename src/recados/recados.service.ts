import { UpdateRecadoDto } from './dto/update-recado.dto';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { ForbiddenException, Injectable, NotFoundException, Query } from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginationDto } from 'src/common/dto/paginatiom.dto';
import { TokenPayloadDto } from 'src/auth/dto/token.payload.dto';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoasService: PessoasService,
  ) { }


  throwNotFoundErroe() {
    throw new NotFoundException('Recado não encontrado');
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const recados = await this.recadoRepository.find({
      take: limit,
      skip: offset,
      relations: ['de', 'para'],
      order: { id: 'desc' },
      select: {
        de: { id: true, nome: true },
        para: { id: true, nome: true }
      }
    });
    if (recados) return recados;
    this.throwNotFoundErroe();
  }

  async findOne(id: number) {
    const recado = await this.recadoRepository.findOne(
      {
        where:
          { id },
        relations: ['de', 'para'],
        select: {
          de: {
            id: true,
            nome: true
          },
          para: {
            id: true,
            nome: true
          }
        }
      });
    if (recado) return recado;
    this.throwNotFoundErroe();
  }

  async create(
    createRecadoDto: CreateRecadoDto, 
    tokenPayload: TokenPayloadDto
  ) {
    const { paraId } = createRecadoDto;
    const para = await this.pessoasService.findOne(paraId);
    const de = await this.pessoasService.findOne(tokenPayload.sub);
    const newRecado = { 
      de, 
      para, 
      texto: 
      createRecadoDto.texto, 
      lido: false, 
      data: new Date() 
    };
    const recado = await this.recadoRepository.create(newRecado);
    await this.recadoRepository.save(recado);
    return {
      ...recado,
      de: { 
        id: recado.de.id, 
        nome: recado.de.nome
      },
      para: { 
        para: recado.para.id, 
        nome: recado.para.nome  
      }
    };
  }

  async update(
    id: number, 
    updateRecadoDto: UpdateRecadoDto,
    tokenPayload: TokenPayloadDto 
  ) {

    const recado = await this.findOne(id);

    if(recado.de.id !== tokenPayload.sub) {
      throw new ForbiddenException('Operação permitida apenas para o proprietário do recado');
    }

    recado.lido = updateRecadoDto?.lido ?? recado.lido; 
    recado.texto = updateRecadoDto?.texto ?? recado.texto;

    if (!recado) {
      return this.throwNotFoundErroe();
    }
    return this.recadoRepository.save(recado);
  }

  async remove(
    id: number,
    tokenPayload: TokenPayloadDto 
  ) {
    const recado = await this.findOne(id );
    if(recado.de.id !== tokenPayload.sub) {
      throw new ForbiddenException('Operação permitida apenas para o proprietário do recado');
    }
    return this.recadoRepository.remove(recado);
  }
}
