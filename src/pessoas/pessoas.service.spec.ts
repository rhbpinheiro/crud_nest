import { Repository } from "typeorm";
import { PessoasService } from "./pessoas.service";
import { Pessoa } from "./entities/pessoa.entity";
import { HashingService } from "src/auth/hashing/hashing.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreatePessoaDto } from "./dto/create-pessoa.dto";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { UpdatePessoaDto } from "./dto/update-pessoa.dto";
import * as path from "path";
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('PessoasService', () => {
  let pessoaService: PessoasService;
  let pessoaRepository: Repository<Pessoa>;
  let hashingService: HashingService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            uploadPicture: jest.fn(),

          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();
    pessoaService = module.get<PessoasService>(PessoasService);
    pessoaRepository = module.get<Repository<Pessoa>>(
      getRepositoryToken(Pessoa),
    );
    hashingService = module.get<HashingService>(HashingService);
  });
  it('pessoaService deve estar definido', () => {
    expect(pessoaService).toBeDefined();
  });
  describe('create', () => {
    it('deve criar uma pessoa', async () => {
      //CreatePessoaDto
      const createPessoaDto: CreatePessoaDto = {
        nome: 'teste',
        password: '123456',
        email: 'teste123@email.com',
      };

      const passwordHash = 'hash123456';

      const novaPessoa = {
        id: 1,
        nome: createPessoaDto.nome,
        passwordHash: passwordHash,
        email: createPessoaDto.email,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);

      jest.spyOn(pessoaRepository, 'create').mockReturnValue(novaPessoa as any);


      //Saber se o serv ice foi chamado como createPessoaDto
      const result = await pessoaService.create(createPessoaDto);
      //que o hasing service tenha o metodo hash
      expect(hashingService.hash).toHaveBeenLastCalledWith(
        createPessoaDto.password
      );

      //Saber se o pessoaRepository.create foi chamado como create
      expect(pessoaRepository.create).toHaveBeenLastCalledWith({
        nome: createPessoaDto.nome,
        passwordHash: passwordHash,
        email: createPessoaDto.email,
      });

      //Saber se o pessoaRepository.save foi chamado com a pessoa ciada
      expect(pessoaRepository.save).toHaveBeenLastCalledWith(novaPessoa);

      //O retorno do service deve ser a pessoa criada
      expect(result).toEqual(novaPessoa);
    });

    it('deve retornar uma exceção de conflito se o email ja esxiste', async () => {

      jest.spyOn(pessoaRepository, 'save').mockRejectedValue({
        code: '23505',
      });

      await expect(pessoaService.create({} as any)).rejects.toThrow(
        ConflictException
      );
    });

    it('deve retornar uma exceção de conflito', async () => {

      jest.spyOn(pessoaRepository, 'save')
        .mockRejectedValue(new Error('Erro genérico.'));

      await expect(pessoaService.create({} as any)).rejects.toThrow(
        new Error('Erro genérico.')
      );
    });

  });

  describe('findOne', () => {

    it('deve retornar uma pessoa', async () => {
      const pessoaId = 1;
      const pessoaEncontrada = {
        id: pessoaId,
        nome: 'teste',
        email: 'teste123@email.com',
        passwordHash: 'hash123456',
      } as any;
      jest.spyOn(pessoaRepository, 'findOneBy').mockResolvedValue(pessoaEncontrada);
      const result = await pessoaService.findOne(pessoaId);
      expect(result).toEqual(pessoaEncontrada);
    });

    it('deve lancar uma exceção de pessoa nao encontrada', async () => {
      await expect(
        pessoaService.findOne(1))
        .rejects
        .toThrow(
          NotFoundException
        );
    });
  });

  describe('findAll', () => {

    it('deve retornar uma lista de pessoas', async () => {
      const pessoasEncontradas: Pessoa[] = [
        {
          id: 1,
          nome: 'teste',
          email: 'teste123@email.com',
          passwordHash: 'hash123456',
        } as Pessoa,
        {
          id: 2,
          nome: 'teste',
          email: 'teste123@email.com',
          passwordHash: 'hash123456',
        } as Pessoa,
      ];
      jest.spyOn(pessoaRepository, 'find').mockResolvedValue(pessoasEncontradas as any);
      const result = await pessoaService.findAll();
      expect(result).toEqual(pessoasEncontradas);
      expect(pessoaRepository.find).toHaveBeenCalledWith({
        order: {
          id: 'desc',
        },
      })

    })
  })

  describe('update', () => {

    it('deve atualizar uma pessoa', async () => {

      const pessoaId = 1;

      const updatePessoaDto: UpdatePessoaDto = {
        nome: 'teste',
        email: 'teste123@email.com',
        password: '123456',
      };
      const tokenPayload = {
        sub: pessoaId,
      } as any;
      const passwordHash = 'hash123456';
      const updatePessoa = {
        id: pessoaId,
        nome: 'teste',
        passwordHash: passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValueOnce(passwordHash);

      jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(updatePessoa as any);

      jest.spyOn(pessoaRepository, 'save').mockResolvedValue(updatePessoa as any);

      const result = await pessoaService.update(pessoaId, updatePessoaDto, tokenPayload);

      expect(hashingService.hash).toHaveBeenCalledWith(updatePessoaDto.password);

      expect(pessoaRepository.preload).toHaveBeenCalledWith({
        id: pessoaId,
        nome: updatePessoaDto.nome,
        passwordHash: passwordHash,
      });

      expect(result).toEqual(updatePessoa);


      expect(pessoaRepository.save).toHaveBeenCalledWith(updatePessoa);

    })

    it('deve lancar um NotFoundException de pessoa nao encontrada', async () => {
      const pessoaId = 1;
      const tokenPayload = {
        sub: pessoaId,
      } as any;
      const updatePessoaDto = { nome: 'teste' } as any;

      jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(null);


      await expect(
        pessoaService.update(pessoaId, updatePessoaDto, tokenPayload))
        .rejects
        .toThrow(
          NotFoundException
        );
    });

    it('deve lancar um ForbiddenException de usuário nao autorizado', async () => {
      const pessoaId = 1;
      const tokenPayload = {
        sub: 2,
      } as any;
      const existePessoaDto = { id: pessoaId, nome: 'teste' } as any

      const updatePessoaDto = { nome: 'teste' } as any;

      jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(existePessoaDto as any);


      await expect(
        pessoaService.update(pessoaId, updatePessoaDto, tokenPayload))
        .rejects
        .toThrow(
          ForbiddenException
        );
    });
  });

  describe('remove', () => {
    it('deve remover uma pessoa se autorizado', async () => {
      // Arrange
      const pessoaId = 1; // Pessoa com ID 1
      const tokenPayload = { sub: pessoaId } as any; // Usuário com ID 1
      const existingPessoa = { id: pessoaId, nome: 'John Doe' }; // Pessoa é o Usuário
      // findOne do service vai retornar a pessoa existente
      jest
        .spyOn(pessoaService, 'findOne')
        .mockResolvedValue(existingPessoa as any);
      // O método remove do repositório também vai retornar a pessoa existente
      jest
        .spyOn(pessoaRepository, 'remove')
        .mockResolvedValue(existingPessoa as any);
      // Act
      const result = await pessoaService.remove(pessoaId, tokenPayload);
      // Assert
      // Espero que findOne do pessoaService seja chamado com o ID da pessoa
      expect(pessoaService.findOne).toHaveBeenCalledWith(pessoaId);
      // Espero que o remove do repositório seja chamado com a pessoa existente
      expect(pessoaRepository.remove).toHaveBeenCalledWith(existingPessoa);
      // Espero que a pessoa apagada seja retornada
      expect(result).toEqual(existingPessoa);
    });
    it('deve lançar ForbiddenException se não autorizado', async () => {
      // Arrange
      const pessoaId = 1; // Pessoa com ID 1
      const tokenPayload = { sub: 2 } as any; // Usuário com ID 2
      const existingPessoa = { id: pessoaId, nome: 'John Doe' }; // Pessoa NÃO é o Usuário
      // Espero que o findOne seja chamado com pessoa existente
      jest
        .spyOn(pessoaService, 'findOne')
        .mockResolvedValue(existingPessoa as any);
      // Espero que o servico rejeite porque o usuário é diferente da pessoa
      await expect(
        pessoaService.remove(pessoaId, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });
    it('deve lançar NotFoundException se a pessoa não for encontrada', async () => {
      const pessoaId = 1;
      const tokenPayload = { sub: pessoaId } as any;
      // Só precisamos que o findOne lance uma exception e o remove também deve lançar
      jest
        .spyOn(pessoaService, 'findOne')
        .mockRejectedValue(new NotFoundException());
      await expect(
        pessoaService.remove(pessoaId, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadPicture', () => {
    it('deve salvar a imagem corretamente e atualizar a pessoa', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const mockPessoa = {
        id: 1,
        nome: 'Luiz',
        email: 'luiz@email.com',
      } as Pessoa;

      const tokenPayload = { sub: 1 } as any;

      jest.spyOn(pessoaService, 'findOne').mockResolvedValue(mockPessoa);
      jest.spyOn(pessoaRepository, 'save').mockResolvedValue({
        ...mockPessoa,
        picture: '1.png',
      });

      const filePath = path.resolve(process.cwd(), 'pictures', '1.png');

      // Act
      const result = await pessoaService.uploadPicture(mockFile, tokenPayload);

      // Assert
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, mockFile.buffer);
      expect(pessoaRepository.save).toHaveBeenCalledWith({
        ...mockPessoa,
        picture: '1.png',
      });
      expect(result).toEqual({
        ...mockPessoa,
        picture: '1.png',
      });
    });

    it('deve lançar BadRequestException se o arquivo for muito pequeno', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.png',
        size: 500, // Menor que 1024 bytes
        buffer: Buffer.from('small content'),
      } as Express.Multer.File;

      const tokenPayload = { sub: 1 } as any;

      // Act & Assert
      await expect(
        pessoaService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException se a pessoa não for encontrada', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const tokenPayload = { sub: 1 } as any;

      jest
        .spyOn(pessoaService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        pessoaService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });
  
});



