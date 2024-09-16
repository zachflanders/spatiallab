import React, { useState } from 'react';
import {
  PlusIcon,
  MinusIcon,
  FolderIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { LayerIcon } from './LayerIcon';
import { Directory, Layer } from './types';
import api from '../api';

interface DirectoryNodeProps {
  directory: Directory;
  selectedLayer: Layer | null;
  handleSelection: (layer: Layer) => void;
  editingDirectory: Directory | null;
  isEditingDirectory: boolean;
  setIsEditingDirectory: (isEditing: boolean) => void;
  addDirectory: (name: string, parent: number | null) => void;
  deleteDirectory: (id: number) => void;
  updateDirectory: (id: number, name: string, parent: number | null) => void;
  onContextMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    directory: Directory,
  ) => void;
}

const DirectoryNode: React.FC<DirectoryNodeProps> = ({
  directory,
  selectedLayer,
  handleSelection,
  editingDirectory,
  isEditingDirectory,
  setIsEditingDirectory,
  addDirectory,
  deleteDirectory,
  updateDirectory,
  onContextMenu,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newName, setNewName] = useState(directory.name);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  };

  const submitRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await api.put(`/gis/directories/${directory.id}/`, { name: newName });
      updateDirectory(directory.id, newName, Number(directory.parent) ?? null);
      setIsEditingDirectory(false);
    } catch (error) {
      console.error('Failed to rename directory:', error);
    }
  };

  return (
    <div className="ml-2 pl-2 mt-1">
      <div className="flex items-center">
        <div
          className="mr-2 flex items-center cursor-pointer"
          onClick={toggleExpand}
        >
          {isExpanded ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </div>
        <div className="flex items-center justify-between w-full">
          {isEditingDirectory ? (
            <form onSubmit={submitRename} className="flex items-center">
              <input
                type="text"
                value={newName}
                onChange={handleNameChange}
                className="border rounded p-1"
                autoFocus
              />
              <button type="submit" className="hidden">
                Submit
              </button>
            </form>
          ) : (
            <div
              className="flex items-center cursor-pointer"
              onClick={toggleExpand}
            >
              <FolderIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="flex-grow">
                <span className="truncate w-full">{directory.name}</span>
              </div>
            </div>
          )}
          <button
            className="p-1 pl-0 pr-0 hover:bg-gray-100 rounded  focus:outline-none"
            onClick={(event) => onContextMenu(event, directory)}
          >
            <EllipsisVerticalIcon className="h-4 w-5 flex-shrink-0" />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="ml-2 border-l-2 border-gray-100">
          {directory.subdirectories &&
            directory.subdirectories.map((subdirectory) => (
              <DirectoryNode
                key={subdirectory.id}
                directory={subdirectory}
                selectedLayer={selectedLayer}
                editingDirectory={editingDirectory} // Add this line
                isEditingDirectory={
                  !!editingDirectory && editingDirectory.id === subdirectory.id
                }
                setIsEditingDirectory={setIsEditingDirectory}
                handleSelection={handleSelection}
                addDirectory={addDirectory}
                deleteDirectory={deleteDirectory}
                updateDirectory={updateDirectory}
                onContextMenu={onContextMenu}
              />
            ))}
          <ul className="ml-2">
            {directory.layers &&
              directory.layers.map((layer) => (
                <li
                  key={layer.id}
                  className={`pl-2 mt-1 flex items-center cursor-pointer rounded-md hover:bg-gray-100 ${selectedLayer && selectedLayer.id === layer.id ? 'bg-gray-100' : 'bg-white'}`}
                  onClick={() => handleSelection(layer)}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <span className="mr-2">
                    <LayerIcon fill="#000" width="20px" height="20px" />
                  </span>
                  <span className="truncate">{layer.name}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DirectoryNode;
