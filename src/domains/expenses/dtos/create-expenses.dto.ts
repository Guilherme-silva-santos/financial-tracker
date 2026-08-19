import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Expense description',
    example: 'Flight to Paris',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description!: string;

  @ApiProperty({ description: 'Expense amount', example: 1000.0 })
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    description: 'Category ID for the expense',
    example: 'category-uuid',
  })
  @IsString()
  @IsNotEmpty()
  categoriesId!: string;
}
