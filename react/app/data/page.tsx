'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GeoServerMap from '@/components/GeoServerMap';
import LayerTable from '@/components/LayerTable';
import EditableName from './EditableName';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { getCookie } from '../accounts/auth';
import api from '../api';

interface Layer {
  id: number;
  name: string;
  extent?: number[];
}

const Page: React.FC = () => {
  const searchParams = useSearchParams();
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
    console.log('Deleting layer:', selectedLayer?.id);
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-screen" style={{ marginTop: -72 }}>
        {/* Content */}
        <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 72 }}>
          {/* Left Pane */}
          <div className="w-1/4 p-2 bg-white overflow-auto border-r">
            <ul>
              {layers.map((layer) => (
                <li
                  key={layer.id}
                  className={`p-2 cursor-pointer rounded-lg hover:bg-gray-800 hover:bg-opacity-5 ${selectedLayer && selectedLayer.id === layer.id ? 'bg-gray-800 bg-opacity-10' : 'bg-white'}`}
                  onClick={() => handleSelection(layer)}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {layer.name}
                </li>
              ))}
            </ul>
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
