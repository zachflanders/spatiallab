'use client';
import React, { useState, useEffect, useRef } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { Layer, ProjectLayer, Basemap } from './types';
import api from '../../api';
import VectorTileLayer from 'ol/layer/VectorTile';
import TileLayer from 'ol/layer/Tile';
import { set } from 'ol/transform';

interface SidebarProps {
  project: any;
  projectLayers: (VectorTileLayer | TileLayer)[];
  setProjectLayers: React.Dispatch<
    React.SetStateAction<(VectorTileLayer | TileLayer)[]>
  >;
  setActiveModal: React.Dispatch<React.SetStateAction<'add' | 'style' | null>>;
  setSelectedStylingLayer: React.Dispatch<
    React.SetStateAction<VectorTileLayer | TileLayer | null>
  >;
}

const Sidebar: React.FC<SidebarProps> = ({
  project,
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
  const [activeLayer, setActiveLayer] = useState<
    VectorTileLayer | TileLayer | null
  >(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const openContextMenu = (
    event: React.MouseEvent,
    layer: VectorTileLayer | TileLayer,
  ) => {
    event.preventDefault();
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setActiveLayer(layer);
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const handleStyleLayer = () => {
    if (activeLayer && !('basemap' in activeLayer.getProperties())) {
      setActiveModal('style');
      setSelectedStylingLayer(activeLayer);
      closeContextMenu();
    }
  };

  const handleRemoveLayer = () => {
    if (!activeLayer) return;
    api
      .delete(`/gis/project-layers/${activeLayer.getProperties().id}/`)
      .then((response) => {
        setProjectLayers((prevProjectLayers) =>
          prevProjectLayers.filter(
            (layer) =>
              layer.getProperties().id !== activeLayer.getProperties().id,
          ),
        );
      });
    closeContextMenu();
  };

  useEffect(() => {
    projectLayers.forEach((layer) => {
      console.log(layer.getProperties());
    });
  }, [projectLayers]);

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

  const handleMoveDown = async () => {
    if (!activeLayer) {
      closeContextMenu();
      return;
    }
    const index = projectLayers.findIndex(
      (layer) => layer.getProperties().id === activeLayer.getProperties().id,
    );
    if (index === 0) {
      closeContextMenu();
      return;
    }
    const response = await api.post(
      `/gis/project-layer/${activeLayer.getProperties().id}/move-up/`,
    );
    if (response.status === 200) {
      const newLayers = [...projectLayers];
      [newLayers[index - 1], newLayers[index]] = [
        newLayers[index],
        newLayers[index - 1],
      ];
      setProjectLayers(newLayers);
    }
    closeContextMenu();
  };

  const handleMoveUp = async () => {
    if (!activeLayer) {
      closeContextMenu();
      return;
    }
    const index = projectLayers.findIndex(
      (layer) => layer.getProperties().id === activeLayer.getProperties().id,
    );
    if (index === projectLayers.length - 1) {
      closeContextMenu();
      return;
    }
    const response = await api.post(
      `/gis/project-layer/${activeLayer.getProperties().id}/move-down/`,
    );
    if (response.status === 200) {
      const newLayers = [...projectLayers];
      [newLayers[index], newLayers[index + 1]] = [
        newLayers[index + 1],
        newLayers[index],
      ];
      setProjectLayers(newLayers);
    }
    closeContextMenu();
  };

  const handleVsibilityChange = (layer: VectorTileLayer | TileLayer) => {
    const properties = layer.getProperties();
    const newLayer = projectLayers.find(
      (l) => l.getProperties().id === properties.id,
    );
    if (!newLayer) return;
    newLayer.setProperties({
      ...properties,
      isVisible: !properties.isVisible,
    });
    newLayer.setVisible(!properties.isVisible);
    setProjectLayers(
      projectLayers.map((l) => {
        if (l.getProperties().id === properties.id) {
          return newLayer;
        }
        return l;
      }),
    );
    api.put(`/gis/project-layers/${layer.getProperties().id}/`, {
      visible: !properties.isVisible,
    });
  };

  return (
    <aside className="w-1/4 bg-white border-r">
      <div className="px-4 py-1">
        <h3 className="font-bold">Project</h3>
      </div>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <div className="font-bold">Project Name:</div>
          <div>{project && project.name}</div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold">Status:</span> Published{' '}
          </div>
          <button className="text-sm border rounded p-2">Embed Code</button>
        </div>
      </div>
      <div className="px-4 py-1 border-t">
        <h3 className="font-bold">Layers</h3>
      </div>
      <div className="p-4 border-t">
        <ul>
          {projectLayers &&
            [...projectLayers].reverse().map((layer) => (
              <li
                key={layer.getProperties().id}
                className="flex items-center justify-between space-x-2 mb-1"
              >
                <input
                  checked={layer.getProperties().isVisible}
                  onChange={() => handleVsibilityChange(layer)}
                  type="checkbox"
                  className=" flex-shrink-0 form-checkbox w-4 h-4 text-blue-600 bg-gray-100 border rounded-lg focus:ring-blue-500 focus:ring-1"
                />
                {'style' in layer.getProperties() && (
                  <div
                    className={`size-4 rounded flex-shrink-0`}
                    style={{
                      borderColor: layer
                        .getProperties()
                        .style.strokeColor.includes('undefined')
                        ? 'black'
                        : layer.getProperties().style.strokeColor,
                      borderWidth: layer.getProperties().style.lineWidth * 2,
                      backgroundColor: layer.getProperties().style.fillColor,
                    }}
                  ></div>
                )}
                <span className="truncate flex-grow">
                  {layer.getProperties().name}
                </span>
                <button
                  onClick={(event) => openContextMenu(event, layer)}
                  className="pt-1 pb-1 hover:bg-gray-100 rounded focus:outline-none"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
        </ul>
      </div>

      {contextMenuVisible && (
        <div
          ref={contextMenuRef}
          className="absolute bg-white shadow-md rounded"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            zIndex: 10,
            overflow: 'hidden',
          }}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={handleMoveUp}
          >
            Move Up
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={handleMoveDown}
          >
            Move Down
          </button>
          {activeLayer &&
            activeLayer.getProperties().name !== 'Open Street Map' && (
              <button
                onClick={handleStyleLayer}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Style Layer
              </button>
            )}
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
