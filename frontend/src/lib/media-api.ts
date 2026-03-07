import api from './api';
import { SignedUploadResponse } from '@/types';

interface SignedUploadDto {
  filename: string;
  mimeType: string;
  size: number;
}

export const mediaApi = {
  getSignedUploadUrl: async (dto: SignedUploadDto): Promise<SignedUploadResponse> => {
    const { data } = await api.clientInstance.post<SignedUploadResponse>(
      '/media/signed-upload',
      dto,
    );
    return data;
  },

  uploadToR2: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },
};
