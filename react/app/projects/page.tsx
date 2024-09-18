'use client';
import React, { useEffect, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import api from '../api';
import AddProjectForm from './AddProjectForm';
import { set } from 'ol/transform';
const Page: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    api.get('/gis/projects/').then((response) => {
      setProjects(response.data);
      setIsLoading(false);
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
    <div className="flex p-3">
      <div className="container mx-auto">
        <div className="justify-between flex items-center mb-4">
          <h2 className="text-xl text-bold">Projects</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={handleOpenModal}
          >
            Add Project
          </button>
        </div>
        <hr />
        {isLoading && <p className="mt-4">Loading...</p>}

        {projects.length > 0 && (
          <ul>
            {projects.map((project) => (
              <li
                key={project.id}
                className="py-2 border-b flex justify-between items-center"
              >
                <div>
                  <Link className="font-bold" href={`/project/${project.id}`}>
                    {project.name}
                  </Link>
                  <p>{project.description}</p>
                </div>
                <Link href={`/project/${project.id}`}>
                  <button className="bg-grey-100 hover:bg-grey-200  py-2 px-3 rounded border flex items-center">
                    View Project <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <AddProjectForm
              projects={projects}
              setProjects={setProjects}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
