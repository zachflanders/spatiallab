import React from 'react';

const MoveFolderModal = ({ directories, onClose, onMove }) => {
  const [selectedFolder, setSelectedFolder] = React.useState(null);

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
  };

  const handleMove = () => {
    if (selectedFolder) {
      console.log('Move folder to:', selectedFolder);
      onMove(selectedFolder);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white p-4 rounded shadow-lg w-1/2">
        <h2 className="text-xl mb-4">Select New Folder</h2>
        <div className="overflow-auto h-64">
          {/* Render directory tree here */}
          {directories.map((dir) => (
            <div
              key={dir.id}
              className={`p-2 cursor-pointer ${selectedFolder === dir.id ? 'bg-gray-200' : ''}`}
              onClick={() => handleSelectFolder(dir.id)}
            >
              {dir.name}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button className="mr-2 p-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="p-2 bg-blue-500 text-white rounded"
            onClick={handleMove}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveFolderModal;
