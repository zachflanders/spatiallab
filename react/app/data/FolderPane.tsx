import { set } from 'ol/transform';
import React, { useState } from 'react';
import {
  FolderPlusIcon,
  PlusIcon,
  MinusIcon,
  FolderIcon,
  ChevronDownIcon,
  UserGroupIcon,
  HomeIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { LayerIcon } from './LayerIcon';
import AddDirectoryModal from './AddDirectoryModal';
import { on } from 'events';
interface Layer {
  id: string;
  name: string;
  directory: number;
}

interface Directory {
  id: number;
  name: string;
  layers: Layer[];
  subdirectories: Directory[];
  parent?: string;
}

interface FolderPaneProps {
  layers: Layer[];
  homeLayers: Layer[];
  directories: Directory[];
  selectedLayer: Layer | null;
  setDirectories: React.Dispatch<React.SetStateAction<Directory[]>>;
  handleSelection: (layer: Layer) => void;
  addDirectory: (name: string, parent: number | null) => void;
  deleteDirectory: (id: number) => void;
  updateDirectory: (id: number, name: string, parent: number | null) => void;
}

const FolderPane: React.FC<FolderPaneProps> = ({
  layers,
  homeLayers,
  directories,
  selectedLayer,
  setDirectories,
  handleSelection,
  addDirectory,
  deleteDirectory,
  updateDirectory,
}) => {
  const [selectedOption, setSelectedOption] = useState(
    <div className="flex items-center">
      <HomeIcon className="h-5 w-5 mr-2" /> Home
    </div>,
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuDirectory, setContextMenuDirectory] = useState(null);

  const handleOptionClick = (option) => {
    console.log(option);
  };
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleContextMenu = (event, directory) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuDirectory(directory);
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
    setContextMenuDirectory(null);
  };

  const handleRename = () => {
    // Implement rename functionality
    closeContextMenu();
  };

  const handleMove = () => {
    // Implement move functionality
    closeContextMenu();
  };

  const handleDelete = () => {
    deleteDirectory(contextMenuDirectory.id);
    closeContextMenu();
  };
  return (
    <div className="bg-white overflow-auto h-full">
      <div className="flex items-center justify-between mb-2 border-b pl-4 p-2">
        <div className="relative">
          <button
            className="p-2 rounded-md border mr-2 bg-white flex items-center"
            onClick={toggleDropdown}
          >
            {selectedOption} <ChevronDownIcon className="h-4 w-4 ml-2" />
          </button>
          {dropdownVisible && (
            <div className="absolute left-0 w-48 pb-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div
                className="p-2 cursor-pointer hover:bg-gray-100 flex items-center"
                onClick={() => handleOptionClick('My data')}
              >
                <HomeIcon className="h-5 w-5 mr-2" /> Home
              </div>
              <div className="mb-2">
                <div className="px-2 mt-2 text-xs text-gray-500">Teams:</div>
                <hr />
              </div>
              <div
                className="p-2 cursor-pointer hover:bg-gray-100 flex items-center"
                onClick={() => handleOptionClick('Team')}
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Spatial Lab
              </div>
            </div>
          )}
        </div>
        <button
          className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-5 items-center text-center"
          onClick={openModal}
        >
          <FolderPlusIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="pr-2">
        {directories &&
          directories.map((directory) => (
            <DirectoryNode
              key={directory.id}
              directory={directory}
              selectedLayer={selectedLayer}
              handleSelection={handleSelection}
              addDirectory={addDirectory}
              deleteDirectory={deleteDirectory}
              updateDirectory={updateDirectory}
              onContextMenu={handleContextMenu}
            />
          ))}
        {homeLayers &&
          homeLayers.map((layer) => (
            <div
              key={layer.id}
              className={`pl-2 mt-1 ml-2 flex items-center cursor-pointer rounded-md hover:bg-gray-100 ${selectedLayer && selectedLayer.id === layer.id ? 'bg-gray-100' : 'bg-white'}`}
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
              {layer.name}
            </div>
          ))}
      </div>
      <AddDirectoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        directories={directories}
        addDirectory={addDirectory}
      />
      {contextMenuVisible && (
        <div
          className="absolute bg-white shadow-md rounded-md py-2"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 100,
          }}
          onMouseLeave={closeContextMenu}
        >
          <button
            className="block w-full text-left p-2 hover:bg-gray-100"
            onClick={handleRename}
          >
            Rename
          </button>
          <button
            className="block w-full text-left p-2 hover:bg-gray-100"
            onClick={handleMove}
          >
            Move
          </button>
          <button
            className="block w-full text-left p-2 hover:bg-gray-100"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

interface DirectoryNodeProps {
  directory: Directory;
  selectedLayer: Layer | null;
  handleSelection: (layer: Layer) => void;
  addDirectory: (name: string, parent: number | null) => void;
  deleteDirectory: (id: number) => void;
  updateDirectory: (id: number, name: string, parent: number | null) => void;
  onContextMenu: (event: React.MouseEvent, directory: Directory) => void;
}

const DirectoryNode: React.FC<DirectoryNodeProps> = ({
  directory,
  selectedLayer,
  handleSelection,
  addDirectory,
  deleteDirectory,
  updateDirectory,
  onContextMenu,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(directory.name);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const submitRename = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/api/directories/${directory.id}/`, { name: newName });
      updateDirectory(directory.id, newName, directory.parent);
      setIsEditing(false);
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
          {isEditing ? (
            <form onSubmit={submitRename} className="flex items-center w-full">
              <input
                type="text"
                value={newName}
                onChange={handleNameChange}
                className="border rounded p-1 w-full"
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
              <FolderIcon className="h-5 w-5 mr-2" />
              {directory.name}
            </div>
          )}
          <button
            className="p-1 pl-0 pr-0 hover:bg-gray-100 rounded  focus:outline-none"
            onClick={(event) => onContextMenu(event, directory)}
          >
            <EllipsisVerticalIcon className="h-4 w-5" />
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
                  {layer.name}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FolderPane;
