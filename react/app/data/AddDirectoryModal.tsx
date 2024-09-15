import React, { useState } from 'react';

const AddDirectoryModal = ({ isOpen, onClose, addDirectory }) => {
  const [directoryName, setDirectoryName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addDirectory(directoryName, null);
    setDirectoryName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl mb-4">Add New Directory</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="border p-2 mb-4 w-full"
            placeholder="Directory Name"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 p-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDirectoryModal;
