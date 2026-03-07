import { Injectable, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

interface R2Config {
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2Bucket: string;
  r2PublicUrl: string;
}

export interface SignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private r2Config: R2Config;

  constructor(private prisma: PrismaService) {}

  private getR2Config(): R2Config {
    if (!this.r2Config) {
      this.r2Config = {
        r2AccountId: process.env.R2_ACCOUNT_ID || '',
        r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        r2Bucket: process.env.R2_BUCKET || '',
        r2PublicUrl: process.env.R2_PUBLIC_URL || '',
      };
    }
    return this.r2Config;
  }

  private getS3Client(): S3Client {
    if (!this.s3Client) {
      const config = this.getR2Config();
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.r2AccessKeyId,
          secretAccessKey: config.r2SecretAccessKey,
        },
      });
    }
    return this.s3Client;
  }

  async generateSignedUploadUrl(
    filename: string,
    mimeType: string,
    userId: string,
    size: number,
  ): Promise<SignedUploadResponse> {
    const config = this.getR2Config();
    const uuid = uuidv4();
    const key = `editor/${userId}/${uuid}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: config.r2Bucket,
      Key: key,
      ContentType: mimeType,
    });

    const signedUrl = await getSignedUrl(this.getS3Client(), command, {
      expiresIn: 300,
    });

    const fileUrl = `${config.r2PublicUrl}/${key}`;

    await this.prisma.media.create({
      data: {
        key,
        url: fileUrl,
        size,
        mimeType,
        uploadedBy: userId,
      },
    });

    return {
      uploadUrl: signedUrl,
      fileUrl,
      key,
    };
  }
}
