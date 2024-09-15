'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GeoServerMap from '@/components/GeoServerMap';
import LayerTable from '@/components/LayerTable';
import EditableName from './EditableName';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { getCookie } from '../accounts/auth';
import api from '../api';
import FolderPane from './FolderPane';
import { set } from 'ol/transform';
import { dir } from 'console';

interface Layer {
  id: number;
  name: string;
  extent?: number[];
  directory?: number;
}

interface Directory {
  id: number;
  name: string;
  layers: Layer[];
  subdirectories: Directory[];
  parent?: number;
}

const Page: React.FC = () => {
  const searchParams = useSearchParams();
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [selectedLayerData, setSelectedLayerData] = useState({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState([]);
  const [extent, setExtent] = useState<[number, number, number, number] | []>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeatures, setTotalFeatures] = useState(0);
  const [csrfToken, setCsrfToken] = useState<string>('');

  const sortLayers = (layers: Layer[]): Layer[] => {
    return layers.sort((a, b) => a.name.localeCompare(b.name));
  };

  useEffect(() => {
    // Fetch the data from the backend
    const csrftoken = getCookie('csrftoken');
    setCsrfToken(csrftoken || '');
    api
      .get('/gis/layers/', { headers: { 'X-CSRFToken': csrfToken || '' } })
      .then((response) => {
        const responseData = response.data;
        const sortedLayers = sortLayers(responseData.layers);
        setLayers(sortedLayers);
        console.log(sortedLayers);

        api.get('/gis/directories/').then((response) => {
          setDirectories(response.data);
          const homeLayers = sortedLayers.filter((layer) => !layer.directory);
          const homeDir: Directory = {
            id: 1,
            name: 'Home',
            layers: homeLayers,
            subdirectories: directories,
          };
          console.log(homeDir);
          console.log(homeLayers);
          setDirectories([homeDir, ...directories]);
        });

        const selectedLayerParam = searchParams.get('selectedLayer');
        if (selectedLayerParam) {
          const layer = sortedLayers.find(
            (layer) => layer.id === parseInt(selectedLayerParam),
          );
          if (layer) {
            handleSelection(layer);
          }
        } else {
          handleSelection(sortedLayers[0]);
        }
      });
  }, [searchParams, setLayers, setHeaders, setData, setExtent, setCsrfToken]);

  const handleSelection = (layer: Layer, page = 1, pageSize = 10) => {
    setSelectedLayer(layer);
    setHeaders([]);
    setData([]);
    setExtent([]);
    api
      .get(`/gis/layer/${layer.id}/`, {
        headers: { 'X-CSRFToken': csrfToken || '' },
        params: { page, pageSize: pageSize },
      })
      .then((response) => {
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
    api
      .delete(`/gis/layer/${selectedLayer?.id}/`, {
        headers: { 'X-CSRFToken': csrfToken },
      })
      .then((response) => {
        setLayers(
          sortLayers(layers.filter((layer) => layer.id !== selectedLayer?.id)),
        );
        api.get('/gis/layers/').then((response) => {
          const responseData = response.data;
          handleSelection(responseData.layers[0]);
        });
      });
  };

  const handleExport = () => {};

  const addDirectory = (name: string, parent: number | null) => {
    api
      .post(
        '/gis/directories/',
        { name, parent },
        { headers: { 'X-CSRFToken': csrfToken || '' } },
      )
      .then((response) => {
        setDirectories([...directories, response.data]);
      });
  };

  const deleteDirectory = (id: number) => {
    api
      .delete(`/gis/directories/${id}/`, {
        headers: { 'X-CSRFToken': csrfToken || '' },
      })
      .then(() => {
        setDirectories(directories.filter((dir) => dir.id !== id));
      });
  };

  const updateDirectory = (id: number, name: string, parent: number | null) => {
    api
      .put(
        `/gis/directories/${id}/`,
        { name, parent },
        { headers: { 'X-CSRFToken': csrfToken || '' } },
      )
      .then((response) => {
        setDirectories(
          directories.map((dir) =>
            dir.id === id ? { ...dir, name, parent } : dir,
          ),
        );
      });
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-screen" style={{ marginTop: -72 }}>
        {/* Content */}
        <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 72 }}>
          {/* Left Pane */}
          <div className="w-1/4 p-2 bg-white overflow-auto border-r">
            <FolderPane
              layers={layers}
              directories={directories}
              setDirectories={setDirectories}
              selectedLayer={selectedLayer}
              handleSelection={handleSelection}
              addDirectory={addDirectory}
              deleteDirectory={deleteDirectory}
              updateDirectory={updateDirectory}
            />
          </div>

          {/* Right Pane */}
          <div className="flex-1 bg-white overflow-auto">
            {selectedLayer && (
              <div>
                <div className="flex justify-between items-center p-1 pr-2 border-b">
                  <EditableName
                    key={selectedLayer.id}
                    initialName={selectedLayer.name}
                    layerId={selectedLayer.id}
                    layers={layers}
                    setLayers={setLayers}
                    sortLayers={sortLayers}
                  ></EditableName>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDelete}
                      className="p-1 hover:bg-gray-200 bg-gray-100 text-gray-500 rounded hover:text-gray-700 focus:outline-none"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleExport}
                      className="p-1 hover:bg-gray-200 bg-gray-100 text-gray-500 rounded hover:text-gray-700 focus:outline-none"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <GeoServerMap
                  layer={selectedLayer.id}
                  extent={extent && !extent.length ? [0, 0, 0, 0] : extent}
                />
                <LayerTable headers={headers} data={data} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Page;
