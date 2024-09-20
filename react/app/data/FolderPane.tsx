import React, { useState, useRef, useEffect } from 'react';
import {
  FolderPlusIcon,
  ChevronDownIcon,
  UserGroupIcon,
  HomeIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { LayerIcon } from './LayerIcon';
import AddDirectoryModal from './AddDirectoryModal';
import { Layer, Directory } from './types';
import DirectoryNode from './DirectoryNode';
import MoveFolderModal from './MoveFolderModal';
import FileUploadForm from '@/components/FileUploadForm';
import { useTasks } from '../TaskProvider';
import { Task } from '../types';

interface FolderPaneProps {
  layers: Layer[];
  homeLayers: Layer[];
  setHomeLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  directories: Directory[];
  selectedLayer: Layer | null;
  setDirectories: React.Dispatch<React.SetStateAction<Directory[]>>;
  handleSelection: (layer: Layer) => void;
  addDirectory: (name: string, parent: number | null) => void;
  deleteDirectory: (id: number) => void;
  updateDirectory: (id: number, name: string, parent: number | null) => void;
  moveDirectory: (
    directoryId: number,
    directoryName: string,
    parent: number | null,
  ) => void;
}

const FolderPane: React.FC<FolderPaneProps> = ({
  layers,
  homeLayers,
  setHomeLayers,
  directories,
  selectedLayer,
  setDirectories,
  handleSelection,
  addDirectory,
  deleteDirectory,
  updateDirectory,
  moveDirectory,
}) => {
  const [selectedOption, setSelectedOption] = useState(
    <div className="flex items-center">
      <HomeIcon className="h-5 w-5 mr-2" /> Home
    </div>,
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuDirectory, setContextMenuDirectory] =
    useState<Directory | null>(null);
  const [editingDirectory, setEditingDirectory] = useState<Directory | null>(
    null,
  );
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [directoryToMove, setDirectoryToMove] = useState<Directory | null>(
    null,
  );
  const { tasks } = useTasks();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target as Node)
    ) {
      closeContextMenu();
    }
  };

  useEffect(() => {
    if (contextMenuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenuVisible]);

  const handleOptionClick = (option: string) => {
    console.log(option);
  };
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const openUploadModal = () => {
    setUploadModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleContextMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    directory: Directory,
  ) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuDirectory(directory);
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
    setContextMenuDirectory(null);
  };

  const startEditing = (directory: Directory | null) => {
    setEditingDirectory(directory);
    closeContextMenu();
  };

  const handleRename = () => {
    startEditing(contextMenuDirectory);
  };

  const doMoveDirectory = (newParentId: number | null) => {
    if (directoryToMove) {
      moveDirectory(directoryToMove.id, directoryToMove.name, newParentId);
    }
  };

  const handleMove = () => {
    setShowMoveModal(true);
    setDirectoryToMove(contextMenuDirectory);
    closeContextMenu();
  };

  const handleDelete = () => {
    if (contextMenuDirectory) {
      deleteDirectory(contextMenuDirectory.id);
    }
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
        <div className="flex items-center space-x-1">
          <button
            className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-5 items-center text-center"
            onClick={openUploadModal}
          >
            <CloudArrowUpIcon className="h-5 w-5" />
          </button>
          <button
            className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-5 items-center text-center"
            onClick={openModal}
          >
            <FolderPlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="pr-2 w-full h-full">
        {directories &&
          directories.map((directory) => (
            <DirectoryNode
              key={directory.id}
              directory={directory}
              selectedLayer={selectedLayer}
              editingDirectory={editingDirectory}
              isEditingDirectory={
                editingDirectory ? editingDirectory.id === directory.id : false
              }
              setIsEditingDirectory={(isEditing) => {
                if (isEditing) {
                  setEditingDirectory(directory);
                } else {
                  setEditingDirectory(null);
                }
              }}
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
              <span className="truncate">{layer.name}</span>
            </div>
          ))}
      </div>
      {tasks.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t p-2">
          {tasks.map((task: Task, index: number) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{task.name}</span>
                <span className="text-sm">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AddDirectoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        directories={directories.map((dir) => ({
          id: dir.id.toString(),
          name: dir.name,
        }))}
        addDirectory={addDirectory}
      />
      {contextMenuVisible && (
        <div
          ref={contextMenuRef}
          className="absolute bg-white shadow-md rounded-md py-2"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 100,
          }}
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
      {showMoveModal && directoryToMove && (
        <MoveFolderModal
          current={directoryToMove}
          homeLayers={homeLayers}
          directories={directories}
          onClose={() => setShowMoveModal(false)}
          onMove={doMoveDirectory}
        />
      )}
      {uploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="shadow-lg">
            <FileUploadForm
              directories={directories}
              setDirectories={setDirectories}
              homeLayers={homeLayers}
              setHomeLayers={setHomeLayers}
              onClose={() => setUploadModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderPane;
