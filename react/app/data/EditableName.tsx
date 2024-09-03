'use client';
import React, { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getCookie } from '../accounts/auth';

const EditableName = ({
  initialName,
  layerId,
  user,
  layers,
  setLayers,
  sortLayers,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = React.useRef(null);

  const csrftoken = getCookie('csrftoken');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    try {
      const response = await fetch(`/api/gis/layer/${layerId}/`, {
        method: 'PUT', // or 'PUT' depending on your API
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        body: JSON.stringify({ name, user }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const updatedLayers = layers.map((layer) =>
        layer.id === layerId ? data : layer,
      );
      const sortedLayers = sortLayers(updatedLayers);
      setLayers(sortedLayers);
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleKeyDown = (e) => {
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
    <div className="flex items-center p-1">
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
        <h1 className="p-2 font-bold">{name}</h1>
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
        <button
          onClick={handleEditClick}
          className="ml-2 p-1 hover:bg-gray-200 bg-gray-100 text-gray-500 rounded hover:text-gray-700 focus:outline-none"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default EditableName;
