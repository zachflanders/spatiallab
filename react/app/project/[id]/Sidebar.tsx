'use client';
import React, { useState, useEffect, useRef } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { Layer, ProjectLayer } from './types';
import api from '../../api';
import { set } from 'ol/transform';

interface SidebarProps {
  projectLayers: ProjectLayer[];
  setProjectLayers: React.Dispatch<React.SetStateAction<ProjectLayer[]>>;
  setActiveModal: React.Dispatch<React.SetStateAction<'add' | 'style' | null>>;
  setSelectedStylingLayer: React.Dispatch<
    React.SetStateAction<ProjectLayer | null>
  >;
}

const Sidebar: React.FC<SidebarProps> = ({
  projectLayers,
  setProjectLayers,
  setActiveModal,
  setSelectedStylingLayer,
}) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [activeLayer, setActiveLayer] = useState<ProjectLayer | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const headerHeight = 72;

  const openContextMenu = (event: React.MouseEvent, layer: ProjectLayer) => {
    event.preventDefault();
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY - headerHeight,
    });
    setActiveLayer(layer);
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const handleStyleLayer = () => {
    setActiveModal('style');
    setSelectedStylingLayer(activeLayer);
    closeContextMenu();
  };

  const handleRemoveLayer = () => {
    if (!activeLayer) return;
    api.delete(`/gis/project-layers/${activeLayer.id}/`).then((response) => {
      setProjectLayers((prevProjectLayers) =>
        prevProjectLayers.filter((layer) => layer.id !== activeLayer.id),
      );
    });
    closeContextMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        closeContextMenu();
      }
    };

    if (contextMenuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenuVisible]);

  return (
    <aside className="w-1/4 bg-white p-4 border-r">
      <h3 className="font-bold mb-2">Layers</h3>
      <hr />
      <ul className="mt-2">
        {projectLayers &&
          projectLayers.map((layer) => (
            <li
              key={layer.id}
              className="flex items-center justify-between mb-2"
            >
              <span className="truncate flex-grow">{layer.name}</span>
              <button
                onClick={(event) => openContextMenu(event, layer)}
                className="pt-1 pb-1 hover:bg-gray-200 bg-gray-100 text-gray-500 rounded hover:text-gray-700 focus:outline-none"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
      </ul>

      {contextMenuVisible && (
        <div
          ref={contextMenuRef}
          className="absolute bg-white shadow-md rounded text-sm"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 10,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={handleStyleLayer}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Style Layer
          </button>
          <button
            onClick={handleRemoveLayer}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Remove Layer
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
