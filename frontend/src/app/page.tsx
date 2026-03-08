'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/editor/Editor';
import { useDocument, useUpdateDocument, useCreateDocument, useDocuments } from '@/hooks/useDocuments';
import api from '@/lib/api';

function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { data: documents, isLoading } = useDocuments();
  const { data: document, isLoading: isLoadingDoc } = useDocument(selectedDocId || '');
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);

  const handleSave = useCallback(
    debounce((newContent: Record<string, unknown>) => {
      if (selectedDocId) {
        updateDocument.mutate({ id: selectedDocId, dto: { content: newContent } });
      }
    }, 3000),
    [selectedDocId, updateDocument],
  );

  const handleContentChange = (newContent: Record<string, unknown>) => {
    setContent(newContent);
    if (selectedDocId) {
      handleSave(newContent);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (selectedDocId) {
      updateDocument.mutate({ id: selectedDocId, dto: { title: newTitle } });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.clientInstance.post('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      api.setToken(response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.clientInstance.post('/auth/register', {
        email: registerEmail,
        password: registerPassword,
      });
      api.setToken(response.data.token);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setIsAuthenticated(false);
    setSelectedDocId(null);
  };

  const handleCreateDocument = async () => {
    const newDoc = await createDocument.mutateAsync({
      title: 'Untitled Document',
      content: { type: 'doc', content: [] },
    });
    setSelectedDocId(newDoc.id);
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await api.clientInstance.delete(`/documents/${id}`);
      if (selectedDocId === id) {
        setSelectedDocId(null);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-gray-900">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isRegistering ? 'Register' : 'Login'}
          </h1>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {              isRegistering ? (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full p-2 border rounded mb-4 bg-white text-black"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-4 bg-white text-black"
                />
              </>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-2 border rounded mb-4 bg-white text-black"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-4 bg-white text-black"
                />
              </>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full mt-4 text-blue-500 hover:underline"
          >
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CMS Editor</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:underline"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-50 border-r p-4">
          <button
            onClick={handleCreateDocument}
            className="w-full bg-blue-500 text-white p-2 rounded mb-4 hover:bg-blue-600"
          >
            New Document
          </button>
          <div className="space-y-2">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              documents?.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedDocId === doc.id ? 'bg-blue-100' : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{doc.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1 p-4">
          {selectedDocId ? (
            isLoadingDoc ? (
              <p>Loading document...</p>
            ) : (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-3xl font-bold w-full mb-4 p-2 border-b focus:outline-none"
                  placeholder="Document Title"
                />
                <Editor
                  content={content}
                  onUpdate={handleContentChange}
                  editable={true}
                />
              </>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a document or create a new one
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
