import { IsString, IsMimeType, IsNumber } from 'class-validator';

export class SignedUploadDto {
  @IsString()
  filename: string;

  @IsMimeType()
  mimeType: string;

  @IsNumber()
  size: number;
}
