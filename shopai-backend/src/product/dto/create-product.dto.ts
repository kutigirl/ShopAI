import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Tai nghe Sony XM5' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @MaxLength(200, { message: 'Tên sản phẩm tối đa 200 ký tự' })
  name: string;

  @ApiProperty({ example: 5000000 })
  @IsNumber({}, { message: 'Giá phải là một con số' })
  @Min(0, { message: 'Giá sản phẩm không được âm' })
  price: number;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b' })
  @IsUrl({}, { message: 'Ảnh sản phẩm phải là một URL hợp lệ' })
  image: string;
}
