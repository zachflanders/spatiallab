'use client';
import React, { useState, useEffect, use } from 'react';
import api from '../app/api';
import { useTasks } from '../app/TaskProvider';
import { Layer, Directory } from '../app/data/types';
import { useRouter } from 'next/navigation';

interface FileUploadFormProps {
  homeLayers: Layer[];
  setHomeLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  directories: Directory[];
  setDirectories: React.Dispatch<React.SetStateAction<Directory[]>>;
  onClose: () => void;
}

const sortLayers = (layers: Layer[]): Layer[] => {
  return layers.sort((a, b) => a.name.localeCompare(b.name));
};

function generateUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({
  homeLayers,
  setHomeLayers,
  directories,
  setDirectories,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [directory, setDirectory] = useState<number | null>(null);
  const { addTask, updateTask, removeTask } = useTasks();

  const router = useRouter();

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
    const uid = generateUID();
    const uploadTask = {
      task_id: uid,
      name: `Uploading: ${file.name}`,
      data: {},
      progress: 0,
    };
    addTask(uploadTask);
    onClose();
    try {
      const body = {
        content_type: file.type,
        extension: file.name.split('.').pop(),
      };
      const response = await api.post('/gis/generate-signed-url/', body);
      const { signed_url, file_name } = await response.data;
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signed_url, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.floor(
            (event.loaded / event.total) * 100,
          );
          updateTask({ ...uploadTask, progress: percentComplete });
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          removeTask(uploadTask.task_id);
          const taskResponse = await api.post('/gis/start-ingest-task/', {
            file_name: file_name,
            layer_name: file.name,
            directory_id: directory,
          });
          const { task_id } = await taskResponse.data;
          let status = 'processing';
          const task = {
            task_id,
            name: `Processing: ${file.name}`,
            data: {},
            progress: 0,
          };
          addTask(task);

          while (status === 'processing') {
            const statusResponse = await api.get(
              `/gis/check-task-status/${task_id}/`,
            );
            const statusData = await statusResponse.data;
            updateTask({ ...task, progress: statusData.progress });
            status = statusData.status;
            if (status === 'completed') {
              const newLayerId = statusData.data.layer_id;
              removeTask(task_id);
              const response = await api.get(`/gis/layer/${newLayerId}/`);
              const newLayer = response.data;
              if (directory) {
                const updateDirectories = (
                  dirs: Directory[],
                  directoryId: number,
                  newLayer: Layer,
                ): Directory[] => {
                  return dirs.map((dir) => {
                    if (dir.id === directoryId) {
                      return {
                        ...dir,
                        layers: sortLayers([...dir.layers, newLayer]),
                      };
                    }
                    if (dir.subdirectories) {
                      return {
                        ...dir,
                        subdirectories: updateDirectories(
                          dir.subdirectories,
                          directoryId,
                          newLayer,
                        ),
                      };
                    }
                    return dir;
                  });
                };
                setDirectories((prevDirectories) =>
                  updateDirectories(prevDirectories, directory, newLayer),
                );
              } else {
                setHomeLayers(sortLayers([...homeLayers, newLayer]));
              }
              router.push(`/data?selected-layer=${newLayerId}`);

              break;
            } else if (status === 'error') {
              console.error('Error processing file:', statusData.error);
              removeTask(task_id);
              break;
            }

            // Update progress indicator on the UI
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } else {
          console.error('Upload failed', xhr.statusText);
        }
      };

      xhr.onerror = () => {
        console.error('Upload error', xhr.statusText);
        removeTask(uploadTask.task_id);
      };

      xhr.send(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      removeTask(uploadTask.task_id);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <h1 className="text-xl font-bold mb-4">Upload File</h1>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} />
      </div>
      <div className="mb-4">
        <select
          value={`${directory}`}
          onChange={(e) => setDirectory(parseInt(e.target.value))}
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
          className="p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Upload
        </button>
      </div>
    </form>
  );
};

export default FileUploadForm;
