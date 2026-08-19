import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Travel' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
