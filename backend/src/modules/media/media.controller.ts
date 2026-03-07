import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MediaService, SignedUploadResponse } from './media.service';
import { SignedUploadDto } from './media.dto';

@Controller('media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('signed-upload')
  async generateSignedUpload(
    @Body() dto: SignedUploadDto,
    @Request() req: { user: { id: string } },
  ): Promise<SignedUploadResponse> {
    return this.mediaService.generateSignedUploadUrl(
      dto.filename,
      dto.mimeType,
      req.user.id,
      dto.size,
    );
  }
}
