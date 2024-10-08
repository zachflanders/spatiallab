import React, { useState } from 'react';

interface AddDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  directories: { id: string; name: string }[];
  addDirectory: (name: string, parentId: number | null) => void;
}

const AddDirectoryModal: React.FC<AddDirectoryModalProps> = ({
  isOpen,
  onClose,
  directories,
  addDirectory,
}) => {
  const [directoryName, setDirectoryName] = useState('');
  const [parentDirectory, setParentDirectory] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    addDirectory(directoryName, parentDirectory || null);
    setDirectoryName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-bold mb-4">Add New Directory</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="border p-2 mb-4 w-full rounded"
            placeholder="Directory Name"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            required
          />
          <select
            className="border p-2 mb-4 w-full rounded bg-white"
            value={`${parentDirectory}`}
            onChange={(e) =>
              setParentDirectory(
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
          >
            <option value="">Select Parent Directory</option>
            {directories.map((directory) => (
              <option key={directory.id} value={directory.id}>
                {directory.name}
              </option>
            ))}
          </select>
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
