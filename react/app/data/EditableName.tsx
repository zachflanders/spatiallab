'use client';
import React, { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getCookie } from '../accounts/auth';
import api from '../api';

interface EditableNameProps {
  initialName: string;
  layerId: number;
  layers: any[];
  setLayers: React.Dispatch<React.SetStateAction<any[]>>;
  sortLayers: (layers: any[]) => any[];
}

const EditableName: React.FC<EditableNameProps> = ({
  initialName,
  layerId,
  layers,
  setLayers,
  sortLayers,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const csrftoken = getCookie('csrftoken');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    try {
      const response = await api.put(
        `/gis/layer/${layerId}/`,
        { name },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!(response.status === 200)) {
        throw new Error('Network response was not ok');
      }
      const data = await response.data;
      const updatedLayers = layers.map((layer) =>
        layer.id === layerId ? data : layer,
      );
      const sortedLayers = sortLayers(updatedLayers);
      setLayers(sortedLayers);
    } catch (error) {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setName(initialName); // Reset the name to the initial value
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="flex items-center">
      {isEditing ? (
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="p-2 font-bold border border-gray-300 rounded"
          autoFocus
          ref={inputRef}
        />
      ) : (
        <h1
          className="p-2 font-bold border rounded border-transparent hover:border-gray-300"
          onClick={handleEditClick}
          style={{
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </h1>
      )}
      {isEditing ? (
        <>
          <button
            onClick={handleBlur}
            className="ml-2 p-1 hover:bg-gray-200 bg-gray-100 text-gray-500 rounded hover:text-gray-700 focus:outline-none"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleCancelClick}
            className="ml-1 p-1 hover:bg-gray-200 bg-gray-100 text-gray-500 rounded hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default EditableName;
