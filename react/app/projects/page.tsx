'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../api';

const AddProject: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    api.get('/gis/projects/').then((response) => {
      setProjects(response.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/gis/projects/', {
        name,
        description,
      });
      setSuccess('Project added successfully!');
      setName('');
      setDescription('');
    } catch (err) {
      setError('Failed to add project. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Project
          </button>
        </div>
      </form>
      {projects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Projects</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.id} className="mb-2">
                <Link className="font-bold" href={`/project/${project.id}`}>
                  {project.name}
                </Link>
                <p>{project.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddProject;
