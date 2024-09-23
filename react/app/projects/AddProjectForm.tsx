'use client';
import React, { useEffect, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import api from '../api';
import { set } from 'ol/transform';

interface AddProjectProps {
  projects: any[];
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
  onClose: () => void;
}
const AddProjectForm: React.FC<AddProjectProps> = ({
  projects,
  setProjects,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/gis/projects/', {
        name,
        description,
      });
      setProjects([...projects, response.data]);
      setSuccess('Project added successfully!');
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError('Failed to add project. Please try again.');
    }
  };
  return (
    <div className="max-w-md w-full md:w-1/2 sm:w-5/6 mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Add New Project</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-500">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Project Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Project
          </button>
        </div>
      </form>
    </div>
  );
};
export default AddProjectForm;
