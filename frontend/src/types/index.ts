export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Document {
  id: string;
  title: string;
  content: Record<string, unknown>;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface CreateDocumentDto {
  title: string;
  content: Record<string, unknown>;
}

export interface UpdateDocumentDto {
  title?: string;
  content?: Record<string, unknown>;
}
