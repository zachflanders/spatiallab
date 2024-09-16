import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Directory, Layer } from './types';

interface MoveFolderModalProps {
  current: Layer | Directory;
  homeLayers: Layer[];
  directories: Directory[];
  onClose: () => void;
  onMove: (folder: number) => void;
}

const MoveFolderModal: React.FC<MoveFolderModalProps> = ({
  current,
  homeLayers,
  directories,
  onClose,
  onMove,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    // Initialize all folders as collapsed
    const initializeCollapsedState = (dirs: Directory[]) => {
      const collapsedState: { [key: string]: boolean } = {};
      const traverse = (directories: Directory[]) => {
        directories.forEach((dir) => {
          collapsedState[dir.id] = true;
          if (dir.subdirectories && dir.subdirectories.length > 0) {
            traverse(dir.subdirectories);
          }
        });
      };
      traverse(dirs);
      return collapsedState;
    };
    setCollapsedFolders(initializeCollapsedState(directories));
  }, [directories]);

  const handleSelectFolder = (folder: number) => {
    console.log(`Selected folder: ${folder}`);
    setSelectedFolder(folder);
  };

  const handleMove = () => {
    if (selectedFolder) {
      console.log(`Moving to ${selectedFolder}`);
      onMove(selectedFolder);
      onClose();
    }
  };

  const toggleCollapse = (folderId: number) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const renderDirectoryTree = (dirs: Directory[]) => {
    return dirs.map((dir) => (
      <div key={dir.id} className="ml-4">
        <div
          className={`p-1 cursor-pointer flex items-center ${selectedFolder === Number(dir.id) ? 'bg-gray-200' : ''}`}
          onClick={() => handleSelectFolder(Number(dir.id))}
        >
          <span
            onClick={() => toggleCollapse(dir.id)}
            className="mr-2 cursor-pointer"
          >
            {collapsedFolders[dir.id] ? (
              <PlusIcon className="h-4 w-4 " />
            ) : (
              <MinusIcon className="h-4 w-4" />
            )}
          </span>
          {dir.name}
        </div>
        {!collapsedFolders[dir.id] &&
          dir.subdirectories &&
          dir.subdirectories.length > 0 && (
            <div className="ml-4">
              {renderDirectoryTree(dir.subdirectories)}
            </div>
          )}
      </div>
    ));
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white p-4 rounded shadow-lg w-1/2">
        <h2 className="text-xl mb-4">{`Move ${current.name}`}</h2>
        <hr />
        <h2 className="text-lg my-4">Select New Folder</h2>
        <div className="overflow-auto h-64 border rounded shadow-inner">
          {renderDirectoryTree(directories)}
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
