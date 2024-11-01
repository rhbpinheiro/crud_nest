import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
@Injectable()
export class ParseIntIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if(metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new BadRequestException('ParseIntPipe espera uma string numérica.');
    }

    if (parsedValue < 0) {
      throw new BadRequestException('ParseIntPipe espera um nùmero maior que zero.');
    }
    return parsedValue;
    
  }
};             