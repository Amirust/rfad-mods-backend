import { IsString } from 'class-validator';

export class ImageWithOrientationDTO {
  @IsString()
  declare url: string;

  @IsString()
  declare orientation: 'vertical' | 'horizontal';
}