import { IsNotEmpty, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRecadoDto {
  @IsString({ message: 'O texto deve ser uma string' })
  @IsNotEmpty({ message: 'O texto não pode ser vazio' })
  @MinLength(5, { message: 'O texto deve ter pelo menos 5 caracteres' })
  @MaxLength(255, { message: 'O texto deve ter no maximo 255 caracteres' })
  readonly texto: string;

  @IsPositive()
  readonly paraId: number;
  readonly lido: boolean;
}
