'use client';
import React, { useState, useRef, useEffect } from 'react';
import GeoServerMap from '@/components/GeoServerMap';
import LayerTable from '@/components/LayerTable';
import EditableName from './EditableName';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { FolderMoveIcon } from './FolderMoveIcon';
import { Directory, Layer } from './types';
import { GripHorizontalIcon } from './GripHorizontalIcon';
import api from '../api';

interface Props {
  // Define your props here
  selectedLayer: Layer;
  homeLayers: Layer[];
  setHomeLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  sortLayers: (layers: Layer[]) => Layer[];
  directories: Directory[];
  setDirectories: React.Dispatch<React.SetStateAction<Directory[]>>;
  handleDelete: () => void;
  setShowMoveModal: React.Dispatch<React.SetStateAction<boolean>>;
  extent: [] | [number, number, number, number];
}

const LayerView: React.FC<Props> = ({
  selectedLayer,
  homeLayers,
  setHomeLayers,
  sortLayers,
  directories,
  setDirectories,
  handleDelete,
  setShowMoveModal,
  extent,
}) => {
  const [height, setHeight] = useState((window.innerHeight - (59 + 73)) / 2);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setHeight((window.innerHeight - (59 + 73)) / 2);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (e: MouseEvent) => {
      const newHeight = startHeight - (e.clientY - startY);
      setHeight(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleExport = () => {
    api
      .get(`/gis/export/layer/${selectedLayer.id}/`, { responseType: 'blob' })
      .then((response) => {
        const blob = response.data;
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'layer.geojson'; // Default filename

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch.length === 2) {
            filename = filenameMatch[1];
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error('Error downloading the file:', error));
  };
  return (
    <div className="flex flex-col h-full">
      {selectedLayer && (
        <>
          <div
            className="flex justify-between items-center p-2 pr-4 border-b"
            style={{ height: '59px' }}
          >
            <div className="flex items-center">
              <EditableName
                key={selectedLayer.id}
                initialName={selectedLayer.name}
                layerId={selectedLayer.id}
                layers={homeLayers}
                setLayers={setHomeLayers}
                sortLayers={sortLayers}
                directories={directories}
                setDirectories={setDirectories}
              ></EditableName>
              <button
                onClick={() => setShowMoveModal(true)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-5 items-center text-center"
              >
                <FolderMoveIcon width="24px" height="24px" />
              </button>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={handleExport}
                className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-5 items-center text-center"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center p-2 rounded-lg hover:bg-gray-800 hover:bg-opacity-5 items-center text-center"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col flex-grow" ref={containerRef}>
            <div className="flex-grow overflow-hidden">
              <GeoServerMap
                layer={Number(selectedLayer.id)}
                extent={extent && !extent.length ? [0, 0, 0, 0] : extent}
                selectedFeatures={selectedFeatures}
                setSelectedFeatures={setSelectedFeatures}
              />
            </div>
            <div
              className="bg-gray-300 cursor-row-resize items-center flex justify-center"
              style={{ height: '2px' }}
              onMouseDown={handleMouseDown}
            >
              <div
                className="justify-center bg-white rounded-md p-1 pt-0 pb-0 cursor-row-resize border drop-shadow-sm"
                onMouseDown={handleMouseDown}
                style={{ zIndex: 9 }}
              >
                <GripHorizontalIcon />
              </div>
            </div>
            <div className="overflow-hidden" style={{ height: `${height}px` }}>
              <div className="h-full overflow-auto">
                <LayerTable
                  layer={selectedLayer}
                  selectedFeatures={selectedFeatures}
                  setSelectedFeatures={setSelectedFeatures}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LayerView;
