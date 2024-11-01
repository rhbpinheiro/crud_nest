import { Optional } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class PaginationDto {
  @Optional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit: number;
  @Optional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number;
}