import { set } from 'ol/transform';
import React, { useState } from 'react';
import {
  FolderPlusIcon,
  PlusIcon,
  MinusIcon,
  FolderIcon,
  ChevronDownIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { LayerIcon } from './LayerIcon';
import AddDirectoryModal from './AddDirectoryModal';
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
      <UserIcon className="h-5 w-5 mr-2" /> My Data
    </div>,
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                <UserIcon className="h-5 w-5 mr-2" /> My Data
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
      {directories.map((directory) => (
        <DirectoryNode
          key={directory.id}
          directory={directory}
          selectedLayer={selectedLayer}
          handleSelection={handleSelection}
          addDirectory={addDirectory}
          deleteDirectory={deleteDirectory}
          updateDirectory={updateDirectory}
        />
      ))}
      <AddDirectoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        addDirectory={addDirectory}
      />
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
}

const DirectoryNode: React.FC<DirectoryNodeProps> = ({
  directory,
  selectedLayer,
  handleSelection,
  addDirectory,
  deleteDirectory,
  updateDirectory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="ml-2 px-2">
      <div className="flex items-center cursor-pointer" onClick={toggleExpand}>
        <div className="mr-2 flex items-center">
          {isExpanded ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </div>
        <div className="flex items-center">
          <FolderIcon className="h-5 w-5 mr-2" />
          {directory.name}
        </div>
      </div>
      {isExpanded && (
        <div className="ml-2 border-l-2 border-gray-100">
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
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default FolderPane;
