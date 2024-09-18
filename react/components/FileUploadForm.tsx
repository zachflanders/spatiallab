'use client';
import React, { useState, useEffect, use } from 'react';
import Button from './Button';
import { useRouter } from 'next/navigation';
import { getCookie } from '../app/accounts/auth';
import api from '../app/api';
import { Directory } from '../app/data/types';

interface FileUploadFormProps {
  onClose: () => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [directory, setDirectory] = useState<number | null>(null);
  const [directories, setDirectories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get('/gis/directories/').then((response) => {
      setDirectories(response.data);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      console.error('No file selected');
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    if (directory) {
      formData.append('directory', directory.toString());
    }

    try {
      const response = await api.post('/gis/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push(`/data?selectedLayer=${response.data.layer_id}`);
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <h1 className="text-xl font-bold mb-4">Upload File</h1>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} disabled={uploading} />
      </div>
      <div className="mb-4">
        <select
          value={`${directory}`}
          onChange={(e) => setDirectory(parseInt(e.target.value))}
          disabled={uploading}
          className="border p-2 w-full rounded bg-white"
        >
          <option value="">Select Directory</option>
          {directories.map((directory: Directory) => (
            <option key={directory.id} value={directory.id}>
              {directory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex">
        <button onClick={onClose} className="mr-2 p-2 bg-gray-300 rounded">
          Cancel
        </button>

        <button
          type="submit"
          disabled={uploading}
          className="p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Upload
        </button>
      </div>
      {uploading && <span>Uploading...</span>}
    </form>
  );
};

export default FileUploadForm;
