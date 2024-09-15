import { set } from 'ol/transform';
import React, { useState } from 'react';
import {
  FolderPlusIcon,
  PlusIcon,
  MinusIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { LayerIcon } from './LayerIcon';
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
  return (
    <div className="p-2 bg-white overflow-auto">
      <div className="flex items-center justify-between mb-2 border-b">
        <h3 className="font-bold items-center">Layers</h3>
        <button
          className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-5 items-center text-center"
          onClick={() => addDirectory('New Folder', null)}
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
    <div className="ml-2">
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
            {directory.layers.map((layer) => (
              <li
                key={layer.id}
                className={`pl-2 mt-1 flex items-center cursor-pointer rounded-md hover:bg-gray-800 hover:bg-opacity-5 ${selectedLayer && selectedLayer.id === layer.id ? 'bg-gray-800 bg-opacity-10' : 'bg-white'}`}
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
          {directory.subdirectories.map((subdirectory) => (
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
