import api from './api';
import { Document, CreateDocumentDto, UpdateDocumentDto } from '@/types';

export const documentsApi = {
  create: async (dto: CreateDocumentDto): Promise<Document> => {
    const { data } = await api.clientInstance.post<Document>('/documents', dto);
    return data;
  },

  getAll: async (): Promise<Document[]> => {
    const { data } = await api.clientInstance.get<Document[]>('/documents');
    return data;
  },

  getById: async (id: string): Promise<Document> => {
    const { data } = await api.clientInstance.get<Document>(`/documents/${id}`);
    return data;
  },

  update: async (id: string, dto: UpdateDocumentDto): Promise<Document> => {
    const { data } = await api.clientInstance.patch<Document>(`/documents/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.clientInstance.delete(`/documents/${id}`);
  },
};
