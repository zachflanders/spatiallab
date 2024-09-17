'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '../api';
import FolderPane from './FolderPane';
import { GripVerticalIcon } from './GripVerticalIcon';
import { Directory, Layer } from './types';
import MoveFolderModal from './MoveFolderModal';
import LayerView from './LayerView';

const Page: React.FC = () => {
  const searchParams = useSearchParams();
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [homeLayers, setHomeLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState([]);
  const [extent, setExtent] = useState<[number, number, number, number] | []>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeatures, setTotalFeatures] = useState(0);
  const [leftPaneWidth, setLeftPaneWidth] = useState(25);
  const [isResizing, setIsResizing] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const sortLayers = (layers: Layer[]): Layer[] => {
    return layers.sort((a, b) => a.name.localeCompare(b.name));
  };

  useEffect(() => {
    api.get('/gis/layers/').then((response) => {
      const responseData = response.data;
      const sortedLayers = sortLayers(responseData.layers);
      setLayers(sortedLayers);
      api.get('/gis/directories/').then((response) => {
        setDirectories(response.data);
        const homeLayers = sortedLayers.filter((layer) => !layer.directory);
        setHomeLayers(homeLayers);
      });

      const selectedLayerParam = searchParams.get('selectedLayer');
      if (selectedLayerParam) {
        const layer = sortedLayers.find(
          (layer) => layer.id === selectedLayerParam,
        );
        if (layer) {
          handleSelection(layer);
        }
      } else {
        handleSelection(sortedLayers[0]);
      }
    });
  }, [searchParams, setLayers, setHeaders, setData, setExtent]);

  const handleSelection = (layer: Layer, page = 1, pageSize = 10) => {
    setSelectedLayer(layer);
    setHeaders([]);
    setData([]);
    setExtent([]);
    api
      .get(`/gis/layer/${layer.id}/`, {
        params: { page, pageSize: pageSize },
      })
      .then((response) => {
        console.log(response.data);
        const responseData = response.data;
        setHeaders(['Feature ID', ...responseData.headers]);
        setData(responseData.data);
        setExtent(responseData.extent);
        setCurrentPage(responseData.page);
        setPageSize(responseData.page_size);
        setTotalPages(responseData.total_pages);
        setTotalFeatures(responseData.total_features);
      });
  };

  const handleDelete = () => {
    api.delete(`/gis/layer/${selectedLayer?.id}/`).then((response) => {
      const removeLayerRecursive = (dirs: Directory[]): Directory[] => {
        return dirs.map((dir: Directory) => {
          const filteredLayers = dir.layers.filter(
            (layer) => layer.id !== selectedLayer?.id,
          );
          const updatedSubdirectories = dir.subdirectories
            ? removeLayerRecursive(dir.subdirectories)
            : [];

          return {
            ...dir,
            layers: filteredLayers,
            subdirectories: updatedSubdirectories,
          };
        });
      };

      setDirectories((prevDirectories) =>
        removeLayerRecursive(prevDirectories),
      );
      setHomeLayers((prevHomeLayers) =>
        prevHomeLayers.filter((layer) => layer.id !== selectedLayer?.id),
      );
      setSelectedLayer(null);
    });
  };

  const handleExport = () => {};

  const walkTree = (
    directories: Directory[],
    parentId: number,
    callback: (dir: Directory) => Directory,
  ): Directory[] => {
    return directories.map((dir) => {
      if (dir.id === Number(parentId)) {
        return callback(dir);
      }

      if (dir.subdirectories) {
        return {
          ...dir,
          subdirectories: walkTree(dir.subdirectories, parentId, callback),
        };
      }

      return dir;
    });
  };

  const removeDirectoryRecursive = (
    directories: Directory[],
    id: number,
  ): Directory[] => {
    return directories
      .filter((dir) => dir.id !== id)
      .map((dir) => {
        if (dir.subdirectories) {
          return {
            ...dir,
            subdirectories: removeDirectoryRecursive(dir.subdirectories, id),
          };
        }
        return dir;
      });
  };

  const addDirectory = (name: string, parent: number | null) => {
    api.post('/gis/directories/', { name, parent }).then((response) => {
      const newDirectory = response.data;
      setDirectories((prevDirectories) =>
        parent === null
          ? [...prevDirectories, newDirectory]
          : walkTree(prevDirectories, parent, (dir) => ({
              ...dir,
              subdirectories: [...(dir.subdirectories || []), newDirectory],
            })),
      );
    });
  };

  const deleteDirectory = (id: number) => {
    api.delete(`/gis/directories/${id}/`).then(() => {
      setDirectories((prevDirectories) =>
        removeDirectoryRecursive(prevDirectories, id),
      );
    });
  };

  const updateDirectory = (id: number, name: string, parent: number | null) => {
    api.put(`/gis/directories/${id}/`, { name, parent }).then((response) => {
      const updatedDirectory = response.data;
      setDirectories((prevDirectories) => {
        // Remove the directory from its current location
        const directoriesWithoutUpdated = removeDirectoryRecursive(
          prevDirectories,
          id,
        );

        const addAndSortDirectories = (
          dirs: Directory[],
          newDir: Directory,
        ) => {
          const updatedDirs = [...dirs, newDir];
          return updatedDirs.sort((a, b) => a.name.localeCompare(b.name));
        };

        return parent === null
          ? addAndSortDirectories(directoriesWithoutUpdated, updatedDirectory)
          : walkTree(directoriesWithoutUpdated, parent, (dir) => ({
              ...dir,
              subdirectories: addAndSortDirectories(
                dir.subdirectories || [],
                updatedDirectory,
              ),
            }));
      });
    });
  };

  const handleMoveFolder = (
    directoryId: number,
    directoryName: string,
    newParentId: number | null,
  ) => {
    updateDirectory(directoryId, directoryName, newParentId);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      setLeftPaneWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };
  const handleMoveLayer = (newParentId: number | null) => {
    const previousParentId = selectedLayer?.directory;

    api
      .put(`/gis/layer/${selectedLayer?.id}/`, { directory: newParentId })
      .then((response) => {
        const movedLayer = response.data;

        const updateDirectories = (
          dirs: Directory[],
          layer: Layer,
          parentId: number | null,
          remove = false,
        ): Directory[] => {
          return dirs.map((dir) => {
            if (dir.id === parentId) {
              return {
                ...dir,
                layers: remove
                  ? sortLayers(dir.layers.filter((l) => l.id !== layer.id))
                  : sortLayers([...(dir.layers || []), layer]),
              };
            }

            if (dir.subdirectories) {
              return {
                ...dir,
                subdirectories: updateDirectories(
                  dir.subdirectories,
                  layer,
                  parentId,
                  remove,
                ),
              };
            }

            return dir;
          });
        };

        setDirectories((prevDirectories) => {
          // Remove the layer from its old location
          const directoriesWithoutLayer =
            previousParentId && selectedLayer
              ? updateDirectories(
                  prevDirectories,
                  selectedLayer,
                  previousParentId,
                  true,
                )
              : prevDirectories;

          // Add the layer to its new location
          return newParentId !== null
            ? updateDirectories(
                directoriesWithoutLayer,
                movedLayer,
                newParentId,
              )
            : directoriesWithoutLayer;
        });

        setHomeLayers((prevHomeLayers) => {
          // Remove the layer from homeLayers if it was there
          const updatedHomeLayers = prevHomeLayers.filter(
            (layer) => layer.id !== selectedLayer?.id,
          );

          // If the new parent is null, add the layer to homeLayers
          if (newParentId === null) {
            updatedHomeLayers.push(movedLayer);
          }

          return sortLayers(updatedHomeLayers);
        });
        setSelectedLayer(movedLayer);
      });

    console.log('Move layer to:', newParentId);
    setShowMoveModal(false);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-screen" style={{ marginTop: -72 }}>
        {/* Content */}
        <div
          className="flex flex-1 overflow-hidden"
          style={{ paddingTop: 72 }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Left Pane */}
          <div
            className="bg-white overflow-auto h-full"
            style={{ width: `${leftPaneWidth}%` }}
          >
            <FolderPane
              layers={layers}
              homeLayers={homeLayers}
              directories={directories}
              setDirectories={setDirectories}
              selectedLayer={selectedLayer}
              handleSelection={handleSelection}
              addDirectory={addDirectory}
              deleteDirectory={deleteDirectory}
              updateDirectory={updateDirectory}
              moveDirectory={handleMoveFolder}
            />
          </div>
          {/* Resizable Divider */}
          <div className="relative flex items-center" style={{ width: '2px' }}>
            <div
              className="bg-gray-300 cursor-col-resize"
              style={{ width: '2px', height: '100%' }}
              onMouseDown={handleMouseDown}
            />
            <div
              className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-md p-1 pr-0 pl-0 cursor-col-resize border drop-shadow-sm"
              onMouseDown={handleMouseDown}
              style={{ zIndex: 9 }}
            >
              <GripVerticalIcon />
            </div>
          </div>

          {/* Right Pane */}
          <div className="flex-1 h-full bg-white overflow-auto">
            {selectedLayer && (
              <LayerView
                selectedLayer={selectedLayer}
                homeLayers={homeLayers}
                setHomeLayers={setHomeLayers}
                sortLayers={sortLayers}
                directories={directories}
                setDirectories={setDirectories}
                handleDelete={handleDelete}
                setShowMoveModal={setShowMoveModal}
                extent={extent}
              />
            )}
          </div>
        </div>
      </div>
      {showMoveModal && selectedLayer && (
        <MoveFolderModal
          current={selectedLayer}
          homeLayers={homeLayers}
          directories={directories}
          onClose={() => setShowMoveModal(false)}
          onMove={(newParentId) => handleMoveLayer(newParentId)}
        />
      )}
    </Suspense>
  );
};

export default Page;
