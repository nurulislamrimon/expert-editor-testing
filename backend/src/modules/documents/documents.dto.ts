import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsObject()
  content: Record<string, unknown>;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;
}
